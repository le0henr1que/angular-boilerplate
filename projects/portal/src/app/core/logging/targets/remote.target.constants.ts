/** Collects up to this many records before sending. */
export const BATCH_SIZE = 20;

/** Or sends after this time, whichever comes first. */
export const FLUSH_INTERVAL_MS = 5_000;

/** Backend down: keeps at most this many and drops the oldest. */
export const MAX_QUEUED = 100;
