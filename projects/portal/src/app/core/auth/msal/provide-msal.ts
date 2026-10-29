import { DOCUMENT } from '@angular/common';
import { inject, type Provider } from '@angular/core';
import {
  BrowserCacheLocation,
  type IPublicClientApplication,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { MSAL_CACHE } from '@core/config/app-config.enums';
import { Logger } from '@core/logging/logger';
import { AUTH_PATHS } from '../auth.constants';
import { MSAL } from './msal.tokens';

/** Placeholder text in the sample environment values: a hint that they weren't filled in. */
const SAMPLE_VALUE_MARKER = 'REPLACE-WITH';

/** Turns '/saiu' into 'https://portal.example.com/saiu' (MSAL only accepts absolute URLs). */
export function absoluteUrl(path: string, document: Document): string {
  return new URL(path, document.baseURI).href;
}

function createMsalInstance(): IPublicClientApplication {
  const { auth, features } = inject(APP_CONFIG);
  const { msal } = auth;
  if (!msal) throw new Error("auth.mode is 'msal', but auth.msal is null in the environment.");

  const document = inject(DOCUMENT);
  const logger = inject(Logger);
  const log = logger.withContext('msal');
  if (features.authentication && msal.clientId.includes(SAMPLE_VALUE_MARKER)) {
    log.error('auth.msal still has the sample values: fill in clientId and authority.');
  }

  return new PublicClientApplication({
    auth: {
      clientId: msal.clientId,
      authority: msal.authority,
      redirectUri: absoluteUrl(msal.redirectUri, document),
      postLogoutRedirectUri: absoluteUrl(AUTH_PATHS.signedOut, document),
    },
    cache: {
      cacheLocation:
        msal.cache === MSAL_CACHE.localStorage
          ? BrowserCacheLocation.LocalStorage
          : BrowserCacheLocation.SessionStorage,
    },
    system: {
      loggerOptions: {
        // MSAL's internal log goes to our Logger, as [msal]. Never logs personal data.
        piiLoggingEnabled: false,
        logLevel: logger.isEnabled('debug') ? LogLevel.Info : LogLevel.Warning,
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;
          if (level === LogLevel.Error) log.error(message);
          else if (level === LogLevel.Warning) log.warn(message);
          else log.debug(message);
        },
      },
    },
  });
}

/**
 * Registers MSAL (only in `msal` mode, in the MsalLoader injector).
 *
 * We use @azure/msal-browser directly, without @azure/msal-angular: from it we would only use
 * MsalService, a thin wrapper that turns Promises into Observables. The project's gates
 * (requireLogin, requireRole, loop protection) apply to every mode and the token is added by
 * msalTokenInterceptor, so MsalGuard/MsalInterceptor/MsalRedirectComponent don't fit.
 * One package less, and no tying the Angular version to msal-angular's on upgrades.
 */
export function provideMsal(): Provider[] {
  return [{ provide: MSAL, useFactory: createMsalInstance }];
}
