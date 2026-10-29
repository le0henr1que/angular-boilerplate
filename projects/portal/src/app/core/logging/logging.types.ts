import { type LogLevel, type LogThreshold } from './logging.enums';

/**
 * Logging configuration per environment (environments/*.ts → `log`).
 *
 * `level` is the floor for everything: below it nothing is recorded (neither console nor backend).
 * In production the floor can be lowered on the spot, without a new deploy, from the browser
 * console: `supermercadoLog.level('debug')` (see provide-logging.ts).
 */
export interface LogConfig {
  /** Minimum recorded level. `'off'` turns logging off. */
  readonly level: LogThreshold;
  /**
   * Sends records to the backend (in batches). `null` = console only.
   * `level` here is the minimum sent: usually `'warn'`, so the server isn't flooded.
   */
  readonly remote: { readonly url: string; readonly level: LogLevel } | null;
}

/** A log record, ready to go to the console or to the backend. */
export interface LogRecord {
  readonly level: LogLevel;
  /** Where it came from: 'http', 'navigation', 'auth', 'products'... */
  readonly context: string;
  readonly message: string;
  /** Extra data, with sensitive fields already masked. */
  readonly data?: unknown;
  readonly error?: SerializedError;
  /** The original error (clickable stack in the console). Console only: not sent to the backend. */
  readonly original?: unknown;
  /** ISO 8601. */
  readonly timestamp: string;
  /** Identifies the tab: groups every record of the same visit. */
  readonly session: string;
  /** Screen the user was on. */
  readonly route: string;
}

export interface SerializedError {
  readonly name: string;
  readonly message: string;
  readonly stack?: string;
  readonly status?: number;
}

/** Where records go (console, backend...). Register with `multi: true` on LOG_TARGETS. */
export interface LogTarget {
  write(record: LogRecord): void;
}

/** Command in the browser console for debugging, even in production. */
export interface LogCommand {
  /** No argument: shows the current level. `null`: goes back to the environment's. */
  level(next?: LogThreshold | null): LogThreshold;
}
