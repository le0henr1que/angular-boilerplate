import { lazyInterceptor } from '@core/http/lazy-interceptor';

// Lazy versions of the mocks: app.config.ts only imports this file, which doesn't import the
// mocks statically. That way the mock API (and the in-memory database) stays out of the
// production bundle: there `mockApi` and `auth.mode: 'mock'` are off and the import() never runs.

export const lazyMockApiInterceptor = lazyInterceptor(() =>
  import('./mock-api.interceptor').then((m) => m.mockApiInterceptor),
);

export const lazyMockAuthInterceptor = lazyInterceptor(() =>
  import('./mock-auth.interceptor').then((m) => m.mockAuthInterceptor),
);
