import { type HttpInterceptorFn } from '@angular/common/http';
import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { from, switchMap } from 'rxjs';

/**
 * Interceptor cujo código só é baixado na primeira requisição (chunk separado, via import()).
 * Serve para o que não pode pesar no bundle inicial, como a API simulada: em produção o
 * interceptor nem é registrado e o chunk nunca é baixado.
 *
 * ```ts
 * interceptorSobDemanda(() => import('./mock-api.interceptor').then((m) => m.mockApiInterceptor))
 * ```
 */
export function interceptorSobDemanda(
  carregar: () => Promise<HttpInterceptorFn>,
): HttpInterceptorFn {
  let interceptor: Promise<HttpInterceptorFn> | undefined;
  return (req, next) => {
    // O inject() do interceptor carregado roda depois do await: guardamos o injector agora,
    // enquanto ainda estamos no contexto de injeção.
    const injector = inject(EnvironmentInjector);
    interceptor ??= carregar();
    return from(interceptor).pipe(
      switchMap((carregado) => runInInjectionContext(injector, () => carregado(req, next))),
    );
  };
}
