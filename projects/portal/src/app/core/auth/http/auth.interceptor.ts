import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { type AppConfig, APP_CONFIG } from '@core/config/app-config';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../auth';

/** A requisição vai para o NOSSO backend (API ou endpoints de auth)? Só esses levam cookie. */
function ehNossoBackend(url: string, config: AppConfig): boolean {
  const bases = [config.apiUrl, ...Object.values(config.auth.urls)];
  return bases.some(
    (base) => url === base || url.startsWith(`${base}/`) || url.startsWith(`${base}?`),
  );
}

/**
 * Autenticação no lado do front (modos mock e bff; no msal só o tratamento do 401):
 * - `withCredentials`: manda o cookie também quando a API está em outro domínio;
 * - header anti-CSRF exigido pelo backend (cookie vai sozinho, então o backend precisa
 *   de uma prova de que a chamada veio do nosso app);
 * - 401 em qualquer chamada = sessão expirou → volta para o login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(APP_CONFIG);
  if (!config.features.autenticacao || !ehNossoBackend(req.url, config)) return next(req);

  const auth = inject(Auth);
  const { headerCsrf, modo } = config.auth;
  // No modo msal a autenticação é o Bearer (msalTokenInterceptor): sem cookie e sem CSRF.
  const comCookie =
    modo === 'msal'
      ? req
      : req.clone({
          withCredentials: true,
          setHeaders: headerCsrf ? { [headerCsrf.nome]: headerCsrf.valor } : {},
        });

  return next(comCookie).pipe(
    catchError((erro: unknown) => {
      // 401 no "/me" é a resposta normal de "não logado", não expiração.
      const ehConsultaDeSessao = req.url === config.auth.urls.usuario;
      if (erro instanceof HttpErrorResponse && erro.status === 401 && !ehConsultaDeSessao) {
        auth.sessaoExpirou();
      }
      return throwError(() => erro);
    }),
  );
};
