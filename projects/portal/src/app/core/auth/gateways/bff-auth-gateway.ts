import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';
import { STATUS_ESPERADOS } from '@core/logging/http/log.interceptor';
import { Logger } from '@core/logging/logger';
import { firstValueFrom } from 'rxjs';
import type { AuthGateway } from './auth-gateway';
import { type Usuario } from '../usuario';

/** Promise que nunca termina: a página está saindo (redirect), nada depois dela deve rodar. */
const paginaSaindo = () => new Promise<never>(() => undefined);

/**
 * Backend real (BFF). Com Azure AD o fluxo é:
 *
 *   1. entrar()  → navega para auth.urls.login?returnUrl=/produtos
 *   2. o backend redireciona para login.microsoftonline.com
 *   3. a Microsoft volta para o backend, que cria o cookie HttpOnly de sessão
 *   4. o backend redireciona para returnUrl; o app abre e buscarUsuario() responde 200
 *
 * O front nunca toca em token: o navegador manda o cookie sozinho.
 */
@Injectable({ providedIn: 'root' })
export class BffAuthGateway implements AuthGateway {
  protected readonly http = inject(HttpClient);
  protected readonly urls = inject(APP_CONFIG).auth.urls;
  readonly #document = inject(DOCUMENT);
  readonly #log = inject(Logger).com('auth');

  async buscarUsuario(): Promise<Usuario | null> {
    try {
      // 401 aqui é "ninguém logado": resposta normal, não aviso no log.
      const context = new HttpContext().set(STATUS_ESPERADOS, [401]);
      return await firstValueFrom(this.http.get<Usuario>(this.urls.usuario, { context }));
    } catch (erro) {
      // 401 = não logado (resposta normal). Outros erros: loga e trata como não logado.
      if (!(erro instanceof HttpErrorResponse && erro.status === 401)) {
        this.#log.error('não foi possível consultar a sessão', erro);
      }
      return null;
    }
  }

  entrar(voltarPara: string): Promise<void> {
    this.#document.location.assign(
      `${this.urls.login}?returnUrl=${encodeURIComponent(voltarPara)}`,
    );
    return paginaSaindo();
  }

  sair(): Promise<void> {
    this.#document.location.assign(this.urls.logout);
    return paginaSaindo();
  }
}
