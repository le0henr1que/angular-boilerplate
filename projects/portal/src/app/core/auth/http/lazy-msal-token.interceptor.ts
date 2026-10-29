import { type HttpInterceptorFn } from '@angular/common/http';
import { inject, runInInjectionContext } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { AUTH_MODE } from '@core/config/app-config.enums';
import { from, switchMap } from 'rxjs';
import { MsalLoader } from '../msal/msal-loader';

/**
 * msalTokenInterceptor without MSAL in the initial bundle. Runs the real interceptor inside the
 * MSAL injector (see MsalLoader). Calls that don't go to `auth.msal.apis` pass straight through,
 * without waiting for the chunk.
 */
export const lazyMsalTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const { auth, features } = inject(APP_CONFIG);
  const toApi = auth.msal?.apis.some((api) => req.url.startsWith(api.url)) ?? false;
  if (auth.mode !== AUTH_MODE.msal || !features.authentication || !toApi) return next(req);

  return from(inject(MsalLoader).load()).pipe(
    switchMap(({ injector, chunk }) =>
      runInInjectionContext(injector, () => chunk.msalTokenInterceptor(req, next)),
    ),
  );
};
