/** How many times to retry a query that failed due to network/server. */
export const MAX_RETRIES = 2;

/**
 * For this long cached data is considered "fresh": going back to a screen already seen shows the
 * cache right away and does NOT call the API. After that, it shows the cache and refreshes in the
 * background.
 */
export const STALE_TIME_MS = 60_000;

/** HTTP status range of client errors (4xx), which don't get better by retrying. */
export const CLIENT_ERROR_STATUS = { min: 400, max: 499 } as const;
