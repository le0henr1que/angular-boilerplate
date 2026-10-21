import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router, type UrlTree } from '@angular/router';
import { APP_CONFIG } from '@core/config/app-config';
import { injectFeatures } from '@core/config/feature-flags';
import { Logger } from '@core/logging/logger';
import { destinoInterno } from './destino-interno';
import { AuthGateway } from './gateways/auth-gateway';
import { type Papel, type Usuario } from './usuario';

export { destinoInterno };

/** Guarda quando o app mandou o usuário para o backend de login (proteção contra loop). */
const CHAVE_TENTATIVA = 'supermercado.login.tentativa';
/** Voltar sem sessão em menos tempo que isso = o login no backend falhou, não tenta de novo. */
const JANELA_LOOP_MS = 10_000;

/**
 * Fonte única da verdade sobre "quem está logado". Guards, interceptor, menu e telas leem daqui.
 * Não sabe se o login é mock ou Azure AD: isso é com o AuthGateway.
 */
@Injectable({ providedIn: 'root' })
export class Auth {
  readonly #gateway = inject(AuthGateway);
  readonly #router = inject(Router);
  readonly #document = inject(DOCUMENT);
  readonly #features = injectFeatures();
  readonly #usuario = signal<Usuario | null>(null);
  readonly #modo = inject(APP_CONFIG).auth.modo;
  readonly #log = inject(Logger).com('auth');
  readonly #saindoDoApp = signal(false);

  readonly usuario = this.#usuario.asReadonly();
  /**
   * true quando a página está indo para o login/logout da Microsoft (bff/msal). O App mostra
   * o carregamento global em vez da tela pela metade até o navegador trocar de página.
   */
  readonly saindoDoApp = this.#saindoDoApp.asReadonly();
  readonly autenticado = computed(() => this.#usuario() !== null);
  /** false quando a flag `autenticacao` está desligada: o app fica aberto. */
  readonly ativa = this.#features.autenticacao;
  /**
   * Só o login simulado (mock) tem tela de login no app (escolher a persona).
   * Nos modos bff e msal quem mostra o login é a Microsoft: o app redireciona direto para lá.
   */
  readonly temTelaDeLogin = this.#modo === 'mock';

  /** Roda uma vez na inicialização (provideAuth), antes da primeira rota. */
  async carregarSessao(): Promise<void> {
    if (!this.ativa) {
      this.#log.debug('autenticação desligada (flag `autenticacao`): app aberto, sem login');
      return;
    }
    this.#log.debug('consultando a sessão', { modo: this.#modo });
    const fim = this.#log.medir('sessão consultada');
    const usuario = await this.#gateway.buscarUsuario();
    fim();
    this.#usuario.set(usuario);
    if (usuario) {
      esquecerTentativa();
      // Só id e papéis: nome e e-mail são dados pessoais e não vão para o log.
      this.#log.info('sessão ativa', { usuario: usuario.id, papeis: usuario.papeis });
      if (usuario.papeis.length === 0 && this.#features.controleDePapeis) {
        this.#log.warn(
          'usuário logado sem nenhum papel conhecido: só verá as telas sem exigePapel',
          { usuario: usuario.id },
        );
      }
    } else {
      this.#log.debug('sem sessão: os gates vão pedir login');
    }
  }

  /** Papel de fato do usuário (ignora flags). */
  temPapel(...papeis: Papel[]): boolean {
    const meus = this.#usuario()?.papeis ?? [];
    return papeis.some((papel) => meus.includes(papel));
  }

  /** Regra de acesso considerando as flags: use esta em guards e no menu. */
  podeAcessar(...papeis: Papel[]): boolean {
    if (!this.ativa || !this.#features.controleDePapeis) return true;
    return this.temPapel(...papeis);
  }

  /**
   * Leva quem não está logado para o login, guardando para onde ele queria ir.
   * - mock: devolve a URL da tela /login (o guard redireciona para ela);
   * - bff/msal: a página sai para a Microsoft (via backend no bff, direto no msal). A Promise nunca termina, então a
   *   navegação fica parada (nada de 404 piscando) até a página sair.
   *   Se o usuário acabou de voltar de lá sem sessão, devolve /erro-login em vez de entrar em loop.
   */
  irParaLogin(voltarPara: string): UrlTree | Promise<never> {
    const destino = destinoInterno(voltarPara);
    if (destino !== voltarPara) {
      this.#log.warn('destino de login fora do app foi descartado (open redirect)', {
        pedido: voltarPara,
        usado: destino,
      });
    }
    if (this.temTelaDeLogin) {
      this.#log.debug('sem sessão: indo para a tela de login simulado', { destino });
      return this.#router.createUrlTree(['/login'], { queryParams: { voltarPara: destino } });
    }
    if (tentouHaPouco()) {
      this.#log.warn(
        'voltou do login sem sessão logo após tentar: mostrando /erro-login (proteção contra loop)',
        { modo: this.#modo, destino, janelaMs: JANELA_LOOP_MS },
      );
      return this.#router.createUrlTree(['/erro-login'], { queryParams: { voltarPara: destino } });
    }
    return this.#iniciarLoginNoBackend(destino);
  }

  async entrar(voltarPara: string, persona?: string): Promise<void> {
    const destino = destinoInterno(voltarPara);
    if (!this.temTelaDeLogin) return this.#iniciarLoginNoBackend(destino); // a página sai daqui
    await this.#gateway.entrar(destino, persona);
    await this.carregarSessao();
    await this.#router.navigateByUrl(destino);
  }

  /** mock: volta para a tela de login. bff: o backend encerra a sessão e redireciona para /saiu. */
  async sair(): Promise<void> {
    this.#log.info('saindo', { modo: this.#modo, usuario: this.#usuario()?.id });
    if (!this.temTelaDeLogin) this.#marcarSaida(); // bff/msal: o logout é na Microsoft
    await this.#gateway.sair(); // no modo bff a página sai daqui
    this.#usuario.set(null);
    await this.#router.navigateByUrl('/login');
  }

  /** Chamado pelos interceptors quando a sessão acaba (API respondeu 401, ou o MSAL pede login de novo). */
  sessaoExpirou(): void {
    if (!this.#usuario()) return;
    this.#log.warn('sessão expirou no meio do uso: pedindo login de novo', {
      usuario: this.#usuario()?.id,
      rota: this.#router.url,
    });
    this.#usuario.set(null);
    const destino = this.irParaLogin(this.#router.url);
    if (!(destino instanceof Promise)) void this.#router.navigateByUrl(destino);
  }

  #iniciarLoginNoBackend(destino: string): Promise<never> {
    // A página vai sair: ligue "Preserve log" no DevTools para não perder estas linhas.
    this.#log.info('redirecionando para o login da Microsoft', { modo: this.#modo, destino });
    lembrarTentativa();
    this.#marcarSaida();
    void this.#gateway.entrar(destino);
    return new Promise<never>(() => undefined);
  }

  #marcarSaida(): void {
    this.#saindoDoApp.set(true);
    // Voltar da Microsoft pelo botão "voltar" pode restaurar esta página do bfcache, congelada
    // no carregamento (a navegação que esperava o redirect nunca termina). Recarrega do zero.
    this.#document.defaultView?.addEventListener(
      'pageshow',
      (evento) => {
        if (evento.persisted) this.#document.location.reload();
      },
      { once: true },
    );
  }
}

// sessionStorage pode estar bloqueado (política do navegador): sem ele, só perde a proteção contra loop.
function lembrarTentativa(): void {
  try {
    sessionStorage.setItem(CHAVE_TENTATIVA, String(Date.now()));
  } catch {
    /* sem storage */
  }
}

function esquecerTentativa(): void {
  try {
    sessionStorage.removeItem(CHAVE_TENTATIVA);
  } catch {
    /* sem storage */
  }
}

function tentouHaPouco(): boolean {
  try {
    const ultima = Number(sessionStorage.getItem(CHAVE_TENTATIVA));
    return ultima > 0 && Date.now() - ultima < JANELA_LOOP_MS;
  } catch {
    return false;
  }
}
