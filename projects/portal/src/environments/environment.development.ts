import { APP_ENVIRONMENT, AUTH_MODE, MSAL_CACHE } from '@core/config/app-config.enums';
import { type AppConfig } from '@core/config/app-config.types';
import { LOG_LEVEL } from '@core/logging/logging.enums';
import { version } from '../../../../package.json';

// Development (`ng serve`). Replaces environment.ts through fileReplacements in angular.json.
export const environment: AppConfig = {
  environment: APP_ENVIRONMENT.development,
  appName: 'Portal Supermercado (DEV)',
  version,
  // Single place for the API base URL: services, the MSAL token and the mock API all follow it
  // (see core/http/api-url.interceptor.ts).
  apiUrl: '/api',
  mockApi: true,
  auth: {
    // ── Simulated login version (uncomment to go back and comment out the msal block below) ──
    // The login screen lists test users (core/auth/gateways/mock-personas.ts).
    mode: AUTH_MODE.mock,
    msal: {
      // Fill in with the app registration in Entra ID (docs/autenticacao-msal.md).
      clientId: 'REPLACE-WITH-FRONT-CLIENT-ID',
      authority: 'https://login.microsoftonline.com/REPLACE-WITH-TENANT-ID',
      redirectUri: '/',
      apis: [{ url: '/api', scopes: ['api://REPLACE-WITH-API-CLIENT-ID/acesso'] }],
      cache: MSAL_CACHE.sessionStorage,
    },

    // ── Azure AD (Entra ID) in the front end ──
    // Fake values: redirects to login.microsoftonline.com, but Microsoft answers
    // AADSTS700016 (app not registered). Replace with the real registration (docs/autenticacao-msal.md).
    // The authority must be an existing tenant ('common' works): MSAL downloads its metadata
    // before redirecting and, with an invalid tenant, fails without leaving the page.
    // mode: AUTH_MODE.msal,
    // msal: {
    //   clientId: '00000000-0000-0000-0000-000000000000',
    //   authority: 'https://login.microsoftonline.com/common',
    //   redirectUri: '/',
    //   apis: [{ url: '/api', scopes: ['api://00000000-0000-0000-0000-000000000000/acesso'] }],
    //   cache: MSAL_CACHE.sessionStorage,
    // },
    urls: { login: '/bff/login', logout: '/bff/logout', user: '/bff/user' },
    csrfHeader: { name: 'X-CSRF', value: '1' },
  },
  log: {
    // Everything: HTTP, navigation, stopwatches. Filter in DevTools by [http], [navigation]...
    level: LOG_LEVEL.debug,
    remote: null,
  },
  features: {
    authentication: true,
    roleControl: true,
    adminArea: true,
    suppliers: true,
    preload: true,
    screenTransitions: true,
    queryDevtools: true,
  },
};
