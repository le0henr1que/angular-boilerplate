import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken, type Provider } from '@angular/core';
import {
  BrowserCacheLocation,
  type IPublicClientApplication,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import { APP_CONFIG } from '@core/config/app-config';
import { Logger } from '@core/logging/logger';

/** O cliente do MSAL (PublicClientApplication). Só existe no injector do CarregadorMsal. */
export const MSAL = new InjectionToken<IPublicClientApplication>('MSAL');

/** Converte '/saiu' em 'https://portal.exemplo.com/saiu' (o MSAL só aceita URL absoluta). */
export function urlAbsoluta(caminho: string, documento: Document): string {
  return new URL(caminho, documento.baseURI).href;
}

function criarInstanciaMsal(): IPublicClientApplication {
  const { auth, features } = inject(APP_CONFIG);
  const { msal } = auth;
  if (!msal) throw new Error("auth.modo é 'msal', mas auth.msal está null no environment.");

  const documento = inject(DOCUMENT);
  const logger = inject(Logger);
  const log = logger.com('msal');
  if (features.autenticacao && msal.clientId.includes('COLOQUE')) {
    log.error('auth.msal ainda tem os valores de exemplo: preencha clientId e authority.');
  }

  return new PublicClientApplication({
    auth: {
      clientId: msal.clientId,
      authority: msal.authority,
      redirectUri: urlAbsoluta(msal.redirectUri, documento),
      postLogoutRedirectUri: urlAbsoluta('/saiu', documento),
    },
    cache: {
      cacheLocation:
        msal.cache === 'localStorage'
          ? BrowserCacheLocation.LocalStorage
          : BrowserCacheLocation.SessionStorage,
    },
    system: {
      loggerOptions: {
        // O log interno do MSAL vai para o nosso Logger, como [msal]. Nunca loga dados pessoais.
        piiLoggingEnabled: false,
        logLevel: logger.ativo('debug') ? LogLevel.Info : LogLevel.Warning,
        loggerCallback: (nivel, mensagem, contemPii) => {
          if (contemPii) return;
          if (nivel === LogLevel.Error) log.error(mensagem);
          else if (nivel === LogLevel.Warning) log.warn(mensagem);
          else log.debug(mensagem);
        },
      },
    },
  });
}

/**
 * Registra o MSAL (só no modo `msal`, no injector do CarregadorMsal).
 *
 * Usamos o @azure/msal-browser direto, sem o @azure/msal-angular: dele só usaríamos o
 * MsalService, um invólucro fino que transforma Promise em Observable. Os gates do projeto
 * (exigeLogin, exigePapel, proteção contra loop) valem para todos os modos e o token é posto
 * pelo msalTokenInterceptor, então MsalGuard/MsalInterceptor/MsalRedirectComponent não servem.
 * Um pacote a menos, e sem amarrar a versão do Angular à do msal-angular nos upgrades.
 */
export function provideMsal(): Provider[] {
  return [{ provide: MSAL, useFactory: criarInstanciaMsal }];
}
