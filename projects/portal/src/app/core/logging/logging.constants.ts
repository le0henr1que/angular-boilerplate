import { LOG_LEVEL, LOG_OFF, type LogThreshold } from './logging.enums';
import { type LogConfig } from './logging.types';

export const LEVEL_WEIGHT: Record<LogThreshold, number> = {
  [LOG_LEVEL.debug]: 10,
  [LOG_LEVEL.info]: 20,
  [LOG_LEVEL.warn]: 30,
  [LOG_LEVEL.error]: 40,
  [LOG_OFF]: 99,
};

/** Used when there is no APP_CONFIG (e.g. isolated tests): errors only, no backend. */
export const DEFAULT_LOG_CONFIG: LogConfig = { level: LOG_LEVEL.error, remote: null };

/** localStorage key that keeps the level chosen at runtime. */
export const SAVED_LEVEL_KEY = 'supermercado.log.level';

/** Header that links the front-end call to the backend log: the same id on both sides. */
export const CORRELATION_HEADER = 'X-Correlation-Id';
