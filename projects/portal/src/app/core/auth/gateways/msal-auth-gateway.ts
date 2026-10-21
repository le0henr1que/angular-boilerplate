import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { type AccountInfo } from '@azure/msal-browser';
import { APP_CONFIG } from '@core/config/app-config';
import { Logger } from '@core/logging/logger';
import { destinoInterno } from '../destino-interno';
import { MSAL } from '../msal/provide-msal';
import { type Papel, type Usuario } from '../usuario';
import type { AuthGateway } from './auth-gateway';

const PAPEIS: readonly Papel[] = ['admin', 'operador', 'cliente'];

/** Promise que nunca termina: a página está saindo (redirect), nada depois dela deve rodar. */
const paginaSaindo = () => new Promise<never>(() => undefined);

/**
 * Conta da Microsoft → Usuario do app.
 * Os papéis vêm da claim `roles` do id token: são os "App roles" do registro do app,
 * atribuídos a usuários/grupos em Enterprise applications. Roles desconhecidas são ignoradas.
 */
export function paraUsuario(conta: AccountInfo): Usuario {
  const roles = conta.idTokenClaims?.roles ?? [];
  return {
    id: conta.localAccountId || conta.homeAccountId,
    nome: conta.name ?? conta.username,
    email: conta.username,
    papeis: roles.filter((role): role is Papel => PAPEIS.includes(role as Papel)),
  };
}

/**
 * Azure AD / Entra ID direto no front, com MSAL. O fluxo:
 *
 *   1. entrar('/produtos') → loginRedirect: a página vai para login.microsoftonline.com
 *      levando o destino no `state`
 *   2. a Microsoft volta para auth.msal.redirectUri com o código na URL
 *   3. o app abre de novo; buscarUsuario() (antes da 1ª rota) troca o código pelos tokens,
 *      põe a URL em '/produtos' e devolve o usuário
 *   4. os gates liberam e a tela abre; o msalTokenInterceptor manda o token para a API
 */
@Injectable({ providedIn: 'root' })
export class MsalAuthGateway implements AuthGateway {
  readonly #msal = inject(MSAL);
  readonly #document = inject(DOCUMENT);
  readonly #log = inject(Logger).com('auth');
  readonly #config = inject(APP_CONFIG).auth.msal;
  readonly #scopes = (this.#config?.apis ?? []).flatMap((api) => api.scopes);

  async buscarUsuario(): Promise<Usuario | null> {
    // A Microsoft devolve o código na URL (#code=... ou ?code=..., conforme o responseMode).
    // Só registramos SE veio, nunca o valor: o código vale como credencial até virar token.
    const local = this.#document.defaultView?.location;
    const voltandoDaMicrosoft = /[#&?](code|error)=/.test(`${local?.search}${local?.hash}`);
    try {
      const fimInit = this.#log.medir('MSAL inicializado');
      await this.#msal.initialize();
      fimInit();

      if (voltandoDaMicrosoft) {
        this.#log.debug('URL tem a resposta da Microsoft: trocando o código pelos tokens');
      }
      // navigateToLoginRequestUrl: false → o MSAL não recarrega a página; nós mesmos
      // pomos a URL no destino (passo 3), antes de o router fazer a 1ª navegação.
      const fimRedirect = this.#log.medir('retorno do redirect processado');
      const resultado = await this.#msal.handleRedirectPromise({
        navigateToLoginRequestUrl: false,
      });
      fimRedirect();

      const instance = this.#msal;
      const contas = instance.getAllAccounts();
      const conta = resultado?.account ?? instance.getActiveAccount() ?? contas[0] ?? null;
      if (!conta) {
        this.#log.debug('nenhuma conta da Microsoft no cache: usuário não logado', {
          voltandoDaMicrosoft,
        });
        return null;
      }

      const origem = resultado?.account ? 'redirect' : 'cache';
      instance.setActiveAccount(conta);
      if (contas.length > 1) {
        this.#log.warn('mais de uma conta da Microsoft no cache: usando a primeira', {
          contas: contas.length,
        });
      }

      const usuario = paraUsuario(conta);
      const roles = conta.idTokenClaims?.roles ?? [];
      const ignoradas = roles.filter((role) => !PAPEIS.includes(role as Papel));
      this.#log.debug('conta da Microsoft encontrada', {
        origem,
        tenant: conta.tenantId,
        roles,
        expiraEm: expiracao(conta),
      });
      if (ignoradas.length > 0) {
        this.#log.warn('roles do token sem papel correspondente no app foram ignoradas', {
          ignoradas,
          conhecidas: PAPEIS,
        });
      }

      if (resultado) {
        this.#log.info('login na Microsoft concluído', {
          usuario: usuario.id,
          papeis: usuario.papeis,
          scopes: resultado.scopes,
        });
      }
      if (resultado?.state) {
        const destino = destinoInterno(resultado.state);
        this.#log.debug('voltando para onde o usuário queria ir', { destino });
        this.#document.defaultView?.history.replaceState(null, '', destino);
      }
      return usuario;
    } catch (erro) {
      // Ex.: usuário cancelou, sem permissão no app, redirectUri não cadastrada.
      // Sem usuário, o Auth mostra /erro-login em vez de tentar em loop.
      this.#log.error('não foi possível concluir o login na Microsoft', erro);
      this.#log.warn('detalhes da falha no login', { voltandoDaMicrosoft, ...detalhesMsal(erro) });
      return null;
    }
  }

  entrar(voltarPara: string): Promise<void> {
    // clientId e authority não são segredo (vão na URL do login): ajudam a achar config errada.
    this.#log.debug('abrindo o login da Microsoft (loginRedirect)', {
      authority: this.#config?.authority,
      clientId: this.#config?.clientId,
      redirectUri: this.#config?.redirectUri,
      scopes: this.#scopes,
      state: voltarPara,
    });
    // Pede já os scopes da API: o consentimento acontece no login, não na 1ª chamada.
    // initialize() de novo é seguro (só roda uma vez) e garante a ordem que o MSAL exige.
    void this.#msal
      .initialize()
      .then(() => this.#msal.loginRedirect({ scopes: this.#scopes, state: voltarPara }))
      .catch((erro: unknown) => {
        // Ex.: endpoints_resolution_error = authority inválida (tenant não existe).
        this.#log.error('não foi possível abrir o login da Microsoft', erro);
        this.#log.warn('detalhes da falha ao abrir o login', {
          authority: this.#config?.authority,
          ...detalhesMsal(erro),
        });
      });
    return paginaSaindo();
  }

  sair(): Promise<void> {
    this.#log.debug('saindo da conta da Microsoft (logoutRedirect)');
    this.#msal
      .logoutRedirect({ account: this.#msal.getActiveAccount() })
      .catch((erro: unknown) => this.#log.error('falha ao sair', erro));
    return paginaSaindo();
  }
}

/** Quando o id token expira, em ISO (claim `exp`, em segundos). */
function expiracao(conta: AccountInfo): string | undefined {
  const exp = conta.idTokenClaims?.exp;
  return typeof exp === 'number' ? new Date(exp * 1000).toISOString() : undefined;
}

/**
 * Campos de diagnóstico dos erros do MSAL (AuthError). O `errorCode` diz o que houve
 * (ex.: user_cancelled, endpoints_resolution_error) e o `correlationId` é o que o suporte
 * da Microsoft pede para achar a requisição nos logs do Entra ID.
 */
function detalhesMsal(erro: unknown): Record<string, unknown> {
  if (typeof erro !== 'object' || erro === null) return {};
  const { errorCode, subError, correlationId } = erro as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries({ errorCode, subError, correlationId }).filter(([, v]) => v),
  );
}
