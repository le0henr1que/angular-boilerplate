import { type EnvironmentProviders, type Provider } from '@angular/core';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

/**
 * TanStack Query for tests: a NEW QueryClient per test (the cache doesn't leak between tests)
 * and no retries (an error shows right away, without waiting for the retry).
 */
export function provideTestQueryClient(): (Provider | EnvironmentProviders)[] {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return [provideTanStackQuery(queryClient)];
}
