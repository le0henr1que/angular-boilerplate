import { inject, Injectable, signal } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { DEFAULT_LOG_CONFIG, LEVEL_WEIGHT, SAVED_LEVEL_KEY } from './logging.constants';
import { LOG_LEVEL, type LogLevel, type LogThreshold } from './logging.enums';
import { LOG_TARGETS } from './logging.tokens';
import { type LogRecord } from './logging.types';
import { mask, serializeError } from './logging.utils';

function readSavedLevel(): LogThreshold | null {
  try {
    const saved = localStorage.getItem(SAVED_LEVEL_KEY);
    return saved && saved in LEVEL_WEIGHT ? (saved as LogThreshold) : null;
  } catch {
    return null;
  }
}

/**
 * The app's single logging point. Nobody calls `console.*` directly: use the Logger.
 *
 * ```ts
 * readonly #log = inject(Logger).withContext('products');
 * this.#log.info('filter applied', { status });
 * this.#log.error('failed to save', error);
 * const done = this.#log.time('build report'); ...; done();
 * ```
 *
 * What shows up depends on the environment's `log.level` (dev: everything; prod: warn and error only).
 */
@Injectable({ providedIn: 'root' })
export class Logger {
  readonly #config = inject(APP_CONFIG, { optional: true })?.log ?? DEFAULT_LOG_CONFIG;
  readonly #targets = inject(LOG_TARGETS, { optional: true }) ?? [];
  readonly #session = Math.random().toString(36).slice(2, 10);

  /** Level in effect: the environment's, or the one chosen at runtime. */
  readonly level = signal<LogThreshold>(readSavedLevel() ?? this.#config.level);

  /** Logger with a fixed context (shown as [context] on each line). */
  withContext(context: string): ContextLogger {
    return new ContextLogger(this, context);
  }

  /** Change the level now. `save` keeps the choice after F5 (on this machine only). */
  setLevel(level: LogThreshold | null, save = true): void {
    try {
      if (save && level) localStorage.setItem(SAVED_LEVEL_KEY, level);
      if (!level) localStorage.removeItem(SAVED_LEVEL_KEY);
    } catch {
      // No localStorage (private tab, blocked): lasts only until F5.
    }
    this.level.set(level ?? this.#config.level);
  }

  /** Is it worth building the record? Use it before expensive log-only computations. */
  isEnabled(level: LogLevel): boolean {
    return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[this.level()];
  }

  log(level: LogLevel, context: string, message: string, data?: unknown): void {
    if (!this.isEnabled(level)) return;
    const isError =
      data instanceof Error || (data as { name?: unknown })?.name === 'HttpErrorResponse';
    const record: LogRecord = {
      level,
      context,
      message,
      ...(data === undefined
        ? {}
        : isError
          ? { error: serializeError(data), original: data }
          : { data: mask(data) }),
      timestamp: new Date().toISOString(),
      session: this.#session,
      route: globalThis.location?.pathname ?? '',
    };
    for (const target of this.#targets) {
      try {
        target.write(record);
      } catch {
        // A broken target can't take down the app or the other targets.
      }
    }
  }
}

export class ContextLogger {
  constructor(
    private readonly logger: Logger,
    readonly context: string,
  ) {}

  debug(message: string, data?: unknown): void {
    this.logger.log(LOG_LEVEL.debug, this.context, message, data);
  }

  info(message: string, data?: unknown): void {
    this.logger.log(LOG_LEVEL.info, this.context, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.logger.log(LOG_LEVEL.warn, this.context, message, data);
  }

  /** Pass the error in `data`: it becomes `{ name, message, stack, status }`. */
  error(message: string, data?: unknown): void {
    this.logger.log(LOG_LEVEL.error, this.context, message, data);
  }

  /** Stopwatch: call the returned function at the end. Records at debug level with the duration. */
  time(message: string): () => void {
    const start = performance.now();
    return () => this.debug(`${message} (${Math.round(performance.now() - start)} ms)`);
  }
}
