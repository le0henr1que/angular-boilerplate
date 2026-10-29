import { type Provider } from '@angular/core';
import { type AppConfig } from '@core/config/app-config.types';
import { provideAppConfig } from '@core/config/app-config';
import { APP_ENVIRONMENT, AUTH_MODE } from '@core/config/app-config.enums';
import { LOG_LEVEL } from '@core/logging/logging.enums';
import { type FeatureFlags } from '@core/config/feature-flags.types';

export const TEST_FEATURES: FeatureFlags = {
  // Off by default: screen tests don't need to sign in. The auth tests turn it on.
  authentication: false,
  roleControl: true,
  adminArea: true,
  suppliers: true,
  preload: false,
  screenTransitions: false,
  queryDevtools: false,
};

export const TEST_APP_CONFIG: AppConfig = {
  environment: APP_ENVIRONMENT.development,
  appName: 'Portal (TESTE)',
  version: '0.0.0-test',
  apiUrl: '/api',
  mockApi: false,
  auth: {
    mode: AUTH_MODE.mock,
    urls: { login: '/bff/login', logout: '/bff/logout', user: '/bff/user' },
    csrfHeader: { name: 'X-CSRF', value: '1' },
    msal: null,
  },
  // Without provideLogging() tests have no target: nothing shows, but the logic runs.
  log: { level: LOG_LEVEL.debug, remote: null },
  features: TEST_FEATURES,
};

/**
 * Environment config for tests. Override only what the test needs;
 * `features` is merged: `provideTestAppConfig({ features: { authentication: true } })`.
 */
export function provideTestAppConfig(
  overrides: Partial<Omit<AppConfig, 'features'>> & { features?: Partial<FeatureFlags> } = {},
): Provider {
  return provideAppConfig({
    ...TEST_APP_CONFIG,
    ...overrides,
    features: { ...TEST_FEATURES, ...overrides.features },
  });
}
