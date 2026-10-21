import {
  DestroyRef,
  type EnvironmentProviders,
  ErrorHandler,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';
import { ConsoleDestino } from './destinos/console.destino';
import { RemotoDestino } from './destinos/remoto.destino';
import { type NivelLog } from './log-config';
import { LogErrorHandler } from './log-error-handler';
import { registrarLogDeNavegacao } from './log-de-navegacao';
import { type DestinoLog, LOG_DESTINOS, Logger } from './logger';

/** Comando no console do navegador para depurar, inclusive em produção. */
interface ComandoDeLog {
  /** Sem argumento: mostra o nível atual. `null`: volta ao do environment. */
  nivel(novo?: NivelLog | 'off' | null): NivelLog | 'off';
}

const NENHUM: DestinoLog = { registrar: () => undefined };

function criarDestinoRemoto(): DestinoLog {
  const { log, auth } = inject(APP_CONFIG);
  if (!log.remoto) return NENHUM;

  const headers = auth.headerCsrf ? { [auth.headerCsrf.nome]: auth.headerCsrf.valor } : {};
  const destino = new RemotoDestino(log.remoto.url, log.remoto.nivel, headers);
  const aoSair = () => destino.enviar(true);
  globalThis.addEventListener?.('pagehide', aoSair);
  inject(DestroyRef).onDestroy(() => globalThis.removeEventListener?.('pagehide', aoSair));
  return destino;
}

function exporComandoNoConsole(): void {
  const logger = inject(Logger);
  const comando: ComandoDeLog = {
    nivel: (novo) => {
      if (novo !== undefined) logger.definirNivel(novo);
      return logger.nivel();
    },
  };
  (globalThis as typeof globalThis & { supermercadoLog?: ComandoDeLog }).supermercadoLog = comando;
}

/**
 * Liga o log do app (ver core/logging/logger.ts):
 * - destinos: console sempre; backend se `log.remoto` estiver configurado;
 * - erros não tratados passam pelo Logger;
 * - navegação do router logada;
 * - comando `supermercadoLog.nivel('debug')` no console do navegador.
 *
 * O interceptor de HTTP (`logInterceptor`) é registrado no withInterceptors do app.config.ts.
 */
export function provideLogging(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: LOG_DESTINOS,
      multi: true,
      useFactory: () => new ConsoleDestino(inject(APP_CONFIG).environment === 'development'),
    },
    { provide: LOG_DESTINOS, multi: true, useFactory: criarDestinoRemoto },
    { provide: ErrorHandler, useClass: LogErrorHandler },
    provideAppInitializer(() => {
      registrarLogDeNavegacao();
      exporComandoNoConsole();
    }),
  ]);
}
