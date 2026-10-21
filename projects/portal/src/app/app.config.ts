import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import {
  type ApplicationConfig,
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
import { msalTokenSobDemandaInterceptor } from '@core/auth/http/msal-token-sob-demanda.interceptor';
import { provideAuth } from '@core/auth/provide-auth';
import { provideAppConfig } from '@core/config/app-config';
import { logInterceptor } from '@core/logging/http/log.interceptor';
import { provideLogging } from '@core/logging/provide-logging';
import { criarQueryClient } from '@core/query/query-client';
import { PreloadPorFlag } from '@core/routing/preload-por-flag';
import { environment } from '@env/environment';
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { withDevtools } from '@tanstack/angular-query-experimental/devtools';
import { mockApiInterceptorSobDemanda, mockAuthInterceptorSobDemanda } from '../mocks/sob-demanda';
import { routes } from './app.routes';

registerLocaleData(localePt);

const { features } = environment;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      ...(features.preload ? [withPreloading(PreloadPorFlag)] : []),
      ...(features.transicoesDeTela ? [withViewTransitions({ skipInitialTransition: true })] : []),
    ),
    provideAppConfig(environment),
    // Logger, erros não tratados e navegação (níveis por ambiente em environment*.ts → log).
    provideLogging(),
    provideHttpClient(
      withFetch(),
      // Ordem importa: o log fica por fora de todos (tempo total e status final) e o
      // authInterceptor logo depois, para ver os 401 dos outros.
      // MSAL e mocks são "sob demanda": cada um é um chunk separado, baixado só no modo que o
      // usa. Importá-los aqui de forma estática os colocaria no bundle inicial de todo ambiente.
      withInterceptors([
        logInterceptor,
        authInterceptor,
        ...(environment.auth.modo === 'msal' ? [msalTokenSobDemandaInterceptor] : []),
        ...(environment.auth.modo === 'mock' ? [mockAuthInterceptorSobDemanda] : []),
        ...(environment.mockApi ? [mockApiInterceptorSobDemanda] : []),
      ]),
    ),
    // Azure AD direto no front: os providers do MSAL entram no CarregadorMsal, sob demanda.
    // Consulta a sessão antes da primeira rota (cookie no mock/bff, cache do MSAL no msal).
    provideAuth(),
    // Cache do TanStack Query (regras globais em core/query/query-client.ts).
    provideTanStackQuery(criarQueryClient(), ...(features.devtoolsQuery ? [withDevtools()] : [])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
