import { type HttpInterceptorFn } from '@angular/common/http';
import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { from, switchMap } from 'rxjs';

/**
 * Interceptor whose code is only downloaded on the first request (separate chunk, via import()).
 * It is for what can't weigh on the initial bundle, like the mock API: in production the
 * interceptor isn't even registered and the chunk is never downloaded.
 *
 * ```ts
 * lazyInterceptor(() => import('./mock-api.interceptor').then((m) => m.mockApiInterceptor))
 * ```
 */
export function lazyInterceptor(load: () => Promise<HttpInterceptorFn>): HttpInterceptorFn {
  let interceptor: Promise<HttpInterceptorFn> | undefined;
  return (req, next) => {
    // The loaded interceptor's inject() runs after the await: keep the injector now,
    // while we are still in the injection context.
    const injector = inject(EnvironmentInjector);
    interceptor ??= load();
    return from(interceptor).pipe(
      switchMap((loaded) => runInInjectionContext(injector, () => loaded(req, next))),
    );
  };
}
