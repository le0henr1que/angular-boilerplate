import { type LogConfig } from '../logging/logging.types';
import { type AppEnvironment, type AuthMode, type MsalCache } from './app-config.enums';
import { type FeatureFlags } from './feature-flags.types';

/**
 * Authentication. Two ways of using Azure AD / Entra ID:
 *
 * - `bff` (cookie): the front end NEVER sees a token. The backend talks to Microsoft and keeps
 *   the session in an HttpOnly cookie. The front end only knows the `urls` endpoints.
 * - `msal` (token in the front end): MSAL signs in in the browser and the front end sends the
 *   access token to the API. Configured in `msal`; `urls` and `csrfHeader` are not used.
 */
export interface AuthConfig {
  /** See AUTH_MODE. */
  readonly mode: AuthMode;
  readonly urls: {
    /** Starts the sign-in on the backend (which redirects to Microsoft). Receives `?returnUrl=`. */
    readonly login: string;
    /** Ends the session on the backend (and at Microsoft). */
    readonly logout: string;
    /** Who is signed in: 200 with the user or 401. */
    readonly user: string;
  };
  /**
   * Anti-CSRF header the backend requires on cookie calls (e.g. `X-CSRF: 1`).
   * `null` = don't send it.
   */
  readonly csrfHeader: { readonly name: string; readonly value: string } | null;
  /** Azure AD / Entra ID in the front end. Required when `mode: 'msal'`; otherwise `null`. */
  readonly msal: MsalConfig | null;
}

/**
 * Values from the app registration in Entra ID (Azure portal → App registrations).
 * Nothing here is secret: an SPA has no client secret. Step by step in docs/autenticacao-msal.md.
 */
export interface MsalConfig {
  /** "Application (client) ID" of the FRONT END registration. */
  readonly clientId: string;
  /** `https://login.microsoftonline.com/<Directory (tenant) ID>`. */
  readonly authority: string;
  /** Path back from sign-in. Must be registered under Authentication → Single-page application. */
  readonly redirectUri: string;
  /** Which APIs get the token, and with which scopes. The URL is matched by prefix. */
  readonly apis: readonly { readonly url: string; readonly scopes: readonly string[] }[];
  /** See MSAL_CACHE. */
  readonly cache: MsalCache;
}

export interface AppConfig {
  readonly environment: AppEnvironment;
  readonly appName: string;
  /** App version (the package.json `version`). Shown in the footer. */
  readonly version: string;
  /** Base API address, the single place for it (see core/http/api-url.interceptor.ts). */
  readonly apiUrl: string;
  /**
   * Turns on the mock API (src/mocks) to develop without a backend.
   * Once the backend exists, set it to false in every environment and delete the mocks/ folder.
   */
  readonly mockApi: boolean;
  readonly auth: AuthConfig;
  /** What is logged and where it goes (see core/logging). */
  readonly log: LogConfig;
  /** Turns features on/off without touching the code (see feature-flags.types.ts). */
  readonly features: FeatureFlags;
}
