/**
 * Environment name instead of a `production: boolean`: a boolean can't represent
 * homologation/staging. To add a new environment, add it here and the compiler points to
 * every place that has to handle it.
 */
export const APP_ENVIRONMENT = {
  development: 'development',
  homologation: 'homologation',
  production: 'production',
} as const;
export type AppEnvironment = (typeof APP_ENVIRONMENT)[keyof typeof APP_ENVIRONMENT];

/**
 * - `mock`: simulated sign-in, no backend (pick a test user; the mock API creates the cookie).
 * - `bff`: real backend. Sign-in and sign-out are full-page redirects to it.
 * - `msal`: the front end itself signs in with Microsoft (MSAL) and sends `Authorization: Bearer`.
 */
export const AUTH_MODE = {
  mock: 'mock',
  bff: 'bff',
  msal: 'msal',
} as const;
export type AuthMode = (typeof AUTH_MODE)[keyof typeof AUTH_MODE];

/**
 * Where MSAL keeps the session. `sessionStorage` (default): gone when the tab closes, each tab
 * signs in (silently, through the Microsoft session). `localStorage`: tabs share it, but it is
 * more exposed.
 */
export const MSAL_CACHE = {
  sessionStorage: 'sessionStorage',
  localStorage: 'localStorage',
} as const;
export type MsalCache = (typeof MSAL_CACHE)[keyof typeof MSAL_CACHE];
