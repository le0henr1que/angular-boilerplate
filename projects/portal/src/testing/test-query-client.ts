import { type EnvironmentProviders, type Provider } from '@angular/core';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

/**
 * TanStack Query para testes: um QueryClient NOVO por teste (cache não vaza entre testes)
 * e sem novas tentativas (um erro aparece na hora, sem esperar o retry).
 */
export function provideTestQueryClient(): (Provider | EnvironmentProviders)[] {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return [provideTanStackQuery(queryClient)];
}
