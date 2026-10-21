import { interceptorSobDemanda } from '@core/http/interceptor-sob-demanda';

// Versões sob demanda dos mocks: o app.config.ts só importa este arquivo, que não importa os
// mocks de forma estática. Assim a API simulada (e o banco em memória) não entra no bundle
// de produção: lá `mockApi` e `auth.modo: 'mock'` estão desligados e o import() nunca roda.

export const mockApiInterceptorSobDemanda = interceptorSobDemanda(() =>
  import('./mock-api.interceptor').then((m) => m.mockApiInterceptor),
);

export const mockAuthInterceptorSobDemanda = interceptorSobDemanda(() =>
  import('./mock-auth.interceptor').then((m) => m.mockAuthInterceptor),
);
