import {
  DestroyRef,
  type EnvironmentProviders,
  ErrorHandler,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { APP_ENVIRONMENT } from '@core/config/app-config.enums';
import { LogErrorHandler } from './log-error-handler';
import { Logger } from './logger';
import { LOG_TARGETS } from './logging.tokens';
import { type LogCommand, type LogTarget } from './logging.types';
import { registerNavigationLog } from './navigation-log';
import { ConsoleTarget } from './targets/console.target';
import { RemoteTarget } from './targets/remote.target';

const NONE: LogTarget = { write: () => undefined };

function createRemoteTarget(): LogTarget {
  const { log, auth } = inject(APP_CONFIG);
  if (!log.remote) return NONE;

  const headers = auth.csrfHeader ? { [auth.csrfHeader.name]: auth.csrfHeader.value } : {};
  const target = new RemoteTarget(log.remote.url, log.remote.level, headers);
  const onLeave = () => target.flush(true);
  globalThis.addEventListener?.('pagehide', onLeave);
  inject(DestroyRef).onDestroy(() => globalThis.removeEventListener?.('pagehide', onLeave));
  return target;
}

function exposeConsoleCommand(): void {
  const logger = inject(Logger);
  const command: LogCommand = {
    level: (next) => {
      if (next !== undefined) logger.setLevel(next);
      return logger.level();
    },
  };
  (globalThis as typeof globalThis & { supermercadoLog?: LogCommand }).supermercadoLog = command;
}

/**
 * Turns on the app's logging (see core/logging/logger.ts):
 * - targets: console always; backend when `log.remote` is configured;
 * - unhandled errors go through the Logger;
 * - router navigation is logged;
 * - `supermercadoLog.level('debug')` command in the browser console.
 *
 * The HTTP interceptor (`logInterceptor`) is registered in app.config.ts's withInterceptors.
 */
export function provideLogging(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: LOG_TARGETS,
      multi: true,
      useFactory: () =>
        new ConsoleTarget(inject(APP_CONFIG).environment === APP_ENVIRONMENT.development),
    },
    { provide: LOG_TARGETS, multi: true, useFactory: createRemoteTarget },
    { provide: ErrorHandler, useClass: LogErrorHandler },
    provideAppInitializer(() => {
      registerNavigationLog();
      exposeConsoleCommand();
    }),
  ]);
}
