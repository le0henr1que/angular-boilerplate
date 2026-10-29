import { APP_ENVIRONMENT, AUTH_MODE, MSAL_CACHE } from '@core/config/app-config.enums';
import { type AppConfig } from '@core/config/app-config.types';
import { LOG_LEVEL } from '@core/logging/logging.enums';
import { version } from '../../../../package.json';

// Homologation (`ng build -c homologation`). Replaces environment.ts through fileReplacements in
// angular.json. Everything here goes into the public bundle: never put secrets here.
// (Azure AD client secret, tenant and the like live on the BACKEND, never here.)
export const environment: AppConfig = {
  environment: APP_ENVIRONMENT.homologation,
  appName: 'Portal Supermercado (HML)',
  version,
  // Single place for the API base URL (see core/http/api-url.interceptor.ts).
  apiUrl: '/api',
  mockApi: false,
  auth: {
    // Azure AD in the front end (MSAL). To go back to the cookie backend: mode 'bff'.
    mode: AUTH_MODE.msal,
    msal: {
      // Fill in with the app registration in Entra ID (docs/autenticacao-msal.md).
      clientId: 'REPLACE-WITH-FRONT-CLIENT-ID',
      authority: 'https://login.microsoftonline.com/REPLACE-WITH-TENANT-ID',
      redirectUri: '/',
      apis: [{ url: '/api', scopes: ['api://REPLACE-WITH-API-CLIENT-ID/acesso'] }],
      cache: MSAL_CACHE.sessionStorage,
    },
    // Only used in 'bff' mode.
    urls: { login: '/bff/login', logout: '/bff/logout', user: '/bff/user' },
    csrfHeader: { name: 'X-CSRF', value: '1' },
  },
  log: {
    // Warnings and errors only. To debug in production, in the browser console:
    // supermercadoLog.level('debug')  …  supermercadoLog.level(null) to go back.
    level: LOG_LEVEL.warn,
    // When the backend has the endpoint, replace with: { url: '/api/logs', level: 'warn' }
    remote: null,
  },
  features: {
    // Turn on after filling in auth.msal (see docs/autenticacao-msal.md).
    authentication: false,
    roleControl: true,
    adminArea: false,
    suppliers: true,
    preload: true,
    screenTransitions: true,
    queryDevtools: false,
  },
};
