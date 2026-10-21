import { type HttpInterceptorFn } from '@angular/common/http';
import { inject, runInInjectionContext } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';
import { from, switchMap } from 'rxjs';
import { CarregadorMsal } from '../msal/carregador-msal';

/**
 * O msalTokenInterceptor sem o MSAL no bundle inicial. Roda o interceptor de verdade dentro
 * do injector do MSAL (ver CarregadorMsal). Chamadas que não vão para `auth.msal.apis`
 * passam direto, sem esperar o chunk.
 */
export const msalTokenSobDemandaInterceptor: HttpInterceptorFn = (req, next) => {
  const { auth, features } = inject(APP_CONFIG);
  const paraApi = auth.msal?.apis.some((api) => req.url.startsWith(api.url)) ?? false;
  if (auth.modo !== 'msal' || !features.autenticacao || !paraApi) return next(req);

  return from(inject(CarregadorMsal).carregar()).pipe(
    switchMap(({ injector, chunk }) =>
      runInInjectionContext(injector, () => chunk.msalTokenInterceptor(req, next)),
    ),
  );
};
