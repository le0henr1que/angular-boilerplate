import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { AUTH_MODE } from '@core/config/app-config.enums';
import { Logger } from '@core/logging/logger';
import { catchError, EMPTY, from, switchMap } from 'rxjs';
import { Auth } from '../auth';
import { MSAL } from '../msal/msal.tokens';

/**
 * `msal` mode: adds `Authorization: Bearer <access token>` to calls to the APIs in
 * `auth.msal.apis`. Other URLs (public APIs, CDN) don't get a token.
 *
 * The token comes from the MSAL cache; close to expiring, MSAL renews it on its own (refresh token).
 * If Microsoft requires signing in again (session expired, password changed, MFA), the app session
 * ends and the user goes to the login, coming back to the same screen.
 */
export const msalTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const { auth, features } = inject(APP_CONFIG);
  if (auth.mode !== AUTH_MODE.msal || !features.authentication) return next(req);

  const api = auth.msal?.apis.find((item) => req.url.startsWith(item.url));
  const msal = inject(MSAL);
  const account = msal.getActiveAccount();
  // No account: go on without a token, the API answers 401 and authInterceptor handles the rest.
  if (!api || !account) return next(req);

  const session = inject(Auth);
  const log = inject(Logger).withContext('auth');

  return from(msal.acquireTokenSilent({ scopes: [...api.scopes], account })).pipe(
    catchError((error: unknown) => {
      if (error instanceof InteractionRequiredAuthError) {
        log.info('Microsoft asked to sign in again', { code: error.errorCode });
        session.sessionExpired();
        return EMPTY; // the page goes to the login; this call doesn't proceed
      }
      throw error;
    }),
    switchMap((result) =>
      next(req.clone({ setHeaders: { Authorization: `Bearer ${result.accessToken}` } })),
    ),
  );
};
