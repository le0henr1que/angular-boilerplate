import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { APP_CONFIG } from '@core/config/app-config';
import { Logger } from '@core/logging/logger';
import { catchError, EMPTY, from, switchMap } from 'rxjs';
import { Auth } from '../auth';
import { MSAL } from '../msal/provide-msal';

/**
 * Modo `msal`: põe `Authorization: Bearer <access token>` nas chamadas para as APIs de
 * `auth.msal.apis`. Outras URLs (APIs públicas, CDN) não recebem token.
 *
 * O token vem do cache do MSAL; perto de expirar, o MSAL renova sozinho (refresh token).
 * Se a Microsoft exigir login de novo (sessão expirou, senha trocada, MFA), a sessão do app
 * acaba e o usuário vai para o login, voltando para a mesma tela.
 */
export const msalTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const { auth, features } = inject(APP_CONFIG);
  if (auth.modo !== 'msal' || !features.autenticacao) return next(req);

  const api = auth.msal?.apis.find((item) => req.url.startsWith(item.url));
  const msal = inject(MSAL);
  const conta = msal.getActiveAccount();
  // Sem conta: segue sem token, a API responde 401 e o authInterceptor cuida do resto.
  if (!api || !conta) return next(req);

  const sessao = inject(Auth);
  const log = inject(Logger).com('auth');

  return from(msal.acquireTokenSilent({ scopes: [...api.scopes], account: conta })).pipe(
    catchError((erro: unknown) => {
      if (erro instanceof InteractionRequiredAuthError) {
        log.info('a Microsoft pediu login de novo', { codigo: erro.errorCode });
        sessao.sessaoExpirou();
        return EMPTY; // a página vai para o login; esta chamada não segue
      }
      throw erro;
    }),
    switchMap((resultado) =>
      next(req.clone({ setHeaders: { Authorization: `Bearer ${resultado.accessToken}` } })),
    ),
  );
};
