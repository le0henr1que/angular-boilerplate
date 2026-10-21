import { type Provider } from '@angular/core';
import { type AppConfig, provideAppConfig } from '@core/config/app-config';
import { type FeatureFlags } from '@core/config/feature-flags';

export const TEST_FEATURES: FeatureFlags = {
  // Desligada por padrão: testes de tela não precisam logar. Os testes de auth ligam.
  autenticacao: false,
  controleDePapeis: true,
  areaAdmin: true,
  fornecedores: true,
  preload: false,
  transicoesDeTela: false,
  devtoolsQuery: false,
};

export const TEST_APP_CONFIG: AppConfig = {
  environment: 'development',
  appName: 'Portal (TESTE)',
  apiUrl: '/api',
  mockApi: false,
  auth: {
    modo: 'mock',
    urls: { login: '/bff/login', logout: '/bff/logout', usuario: '/bff/user' },
    headerCsrf: { nome: 'X-CSRF', valor: '1' },
    msal: null,
  },
  // Sem provideLogging() nos testes não há destino: nada aparece, mas a lógica roda.
  log: { nivel: 'debug', remoto: null },
  features: TEST_FEATURES,
};

/**
 * Config de ambiente para testes. Sobrescreva só o que o teste precisar;
 * `features` é mesclado: `provideTestAppConfig({ features: { autenticacao: true } })`.
 */
export function provideTestAppConfig(
  parcial: Partial<Omit<AppConfig, 'features'>> & { features?: Partial<FeatureFlags> } = {},
): Provider {
  return provideAppConfig({
    ...TEST_APP_CONFIG,
    ...parcial,
    features: { ...TEST_FEATURES, ...parcial.features },
  });
}
