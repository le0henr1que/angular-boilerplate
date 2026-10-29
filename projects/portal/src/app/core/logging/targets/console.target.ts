import { type LogLevel } from '../logging.enums';
import { type LogRecord, type LogTarget } from '../logging.types';

const COLOR: Record<LogLevel, string> = {
  debug: '#6b7280',
  info: '#2563eb',
  warn: '#b45309',
  error: '#dc2626',
};

const METHOD: Record<LogLevel, 'debug' | 'info' | 'warn' | 'error'> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

/**
 * Writes to the browser console.
 * - dev (`withColors`): `12:03:04.123 INFO [http] GET /api/produtos → 200 (812 ms)` in color;
 * - prod: the same line without colors, with the [portal] prefix to filter in DevTools.
 *
 * DevTools' "Verbose" filter must be on to see the debug level.
 */
export class ConsoleTarget implements LogTarget {
  constructor(private readonly withColors: boolean) {}

  write(record: LogRecord): void {
    const { level, context, message } = record;
    const extras = [record.original ?? record.error ?? record.data].filter(
      (extra) => extra !== undefined,
    );
    const method = METHOD[level];

    if (this.withColors) {
      const time = record.timestamp.slice(11, 23);
      console[method](
        `%c${time} ${level.toUpperCase()} [${context}]%c ${message}`,
        `color:${COLOR[level]};font-weight:600`,
        '',
        ...extras,
      );
    } else {
      console[method](`[portal] ${level.toUpperCase()} [${context}] ${message}`, ...extras);
    }
  }
}
