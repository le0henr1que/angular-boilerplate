import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import {
  type ApplicationConfig,
  inject,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { authInterceptor } from '@core/auth/http/auth.interceptor';
import { lazyMsalTokenInterceptor } from '@core/auth/http/lazy-msal-token.interceptor';
import { provideAuth } from '@core/auth/provide-auth';
import { provideAppConfig } from '@core/config/app-config';
import { AUTH_MODE } from '@core/config/app-config.enums';
import { apiUrlInterceptor } from '@core/http/api-url.interceptor';
import { logInterceptor } from '@core/logging/http/log.interceptor';
import { Logger } from '@core/logging/logger';
import { provideLogging } from '@core/logging/provide-logging';
import { createQueryClient } from '@core/query/query-client';
import { FlagPreloadingStrategy } from '@core/routing/flag-preloading-strategy';
import { environment } from '@env/environment';
import { LIST_TABLE_LOGGER } from '@shared/list-table';
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { withDevtools } from '@tanstack/angular-query-experimental/devtools';
import { lazyMockApiInterceptor, lazyMockAuthInterceptor } from '../mocks/lazy-mocks';
import { routes } from './app.routes';

registerLocaleData(localePt);

const { features } = environment;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      ...(features.preload ? [withPreloading(FlagPreloadingStrategy)] : []),
      ...(features.screenTransitions ? [withViewTransitions({ skipInitialTransition: true })] : []),
    ),
    provideAppConfig(environment),
    // Logger, unhandled errors and navigation (levels per environment in environment*.ts → log).
    provideLogging(),
    // shared/ doesn't import core/: the list-table declares the contract and the app plugs in the Logger.
    { provide: LIST_TABLE_LOGGER, useFactory: () => inject(Logger).withContext('list-table') },
    provideHttpClient(
      withFetch(),
      // Order matters: apiUrlInterceptor first, so every other one sees the final URL; then the
      // log wraps the rest (total time and final status) and authInterceptor right after it, to
      // see the others' 401s.
      // MSAL and mocks are lazy: each one is a separate chunk, downloaded only in the mode that
      // uses it. Importing them statically here would put them in every environment's initial bundle.
      withInterceptors([
        apiUrlInterceptor,
        logInterceptor,
        authInterceptor,
        ...(environment.auth.mode === AUTH_MODE.msal ? [lazyMsalTokenInterceptor] : []),
        ...(environment.auth.mode === AUTH_MODE.mock ? [lazyMockAuthInterceptor] : []),
        ...(environment.mockApi ? [lazyMockApiInterceptor] : []),
      ]),
    ),
    // Azure AD in the front end: the MSAL providers go into MsalLoader, lazily.
    // Checks the session before the first route (cookie in mock/bff, MSAL cache in msal).
    provideAuth(),
    // TanStack Query cache (global rules in core/query/query-client.ts).
    provideTanStackQuery(createQueryClient(), ...(features.queryDevtools ? [withDevtools()] : [])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
