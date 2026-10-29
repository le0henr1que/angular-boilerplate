/** From the most detailed to the most severe. */
export const LOG_LEVEL = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
} as const;
export type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];

/** Threshold that turns logging off. */
export const LOG_OFF = 'off';

/** The minimum level that gets recorded: a level, or off. */
export type LogThreshold = LogLevel | typeof LOG_OFF;
