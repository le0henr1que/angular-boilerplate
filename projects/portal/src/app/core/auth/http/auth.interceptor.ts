import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { type AppConfig } from '@core/config/app-config.types';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { AUTH_MODE } from '@core/config/app-config.enums';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../auth';

/** Is the request going to OUR backend (API or auth endpoints)? Only those carry the cookie. */
function isOurBackend(url: string, config: AppConfig): boolean {
  const bases = [config.apiUrl, ...Object.values(config.auth.urls)];
  return bases.some(
    (base) => url === base || url.startsWith(`${base}/`) || url.startsWith(`${base}?`),
  );
}

/**
 * Front-end side of authentication (mock and bff modes; in msal only the 401 handling):
 * - `withCredentials`: sends the cookie also when the API is on another domain;
 * - anti-CSRF header required by the backend (the cookie goes on its own, so the backend needs
 *   proof that the call came from our app);
 * - 401 on any call = the session expired → back to the login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(APP_CONFIG);
  if (!config.features.authentication || !isOurBackend(req.url, config)) return next(req);

  const auth = inject(Auth);
  const { csrfHeader, mode } = config.auth;
  // In msal mode authentication is the Bearer (msalTokenInterceptor): no cookie and no CSRF.
  const withCookie =
    mode === AUTH_MODE.msal
      ? req
      : req.clone({
          withCredentials: true,
          setHeaders: csrfHeader ? { [csrfHeader.name]: csrfHeader.value } : {},
        });

  return next(withCookie).pipe(
    catchError((error: unknown) => {
      // A 401 on "/me" is the normal "not signed in" response, not an expiration.
      const isSessionCheck = req.url === config.auth.urls.user;
      if (error instanceof HttpErrorResponse && error.status === 401 && !isSessionCheck) {
        auth.sessionExpired();
      }
      return throwError(() => error);
    }),
  );
};
