import { HttpErrorResponse } from '@angular/common/http';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { CLIENT_ERROR_STATUS, MAX_RETRIES, STALE_TIME_MS } from './query.constants';

/**
 * Retry policy: a 4xx error (e.g. 404, 403) doesn't get better by retrying;
 * network and 5xx errors retry up to MAX_RETRIES times.
 */
export function shouldRetry(failuresSoFar: number, error: unknown): boolean {
  const clientError =
    error instanceof HttpErrorResponse &&
    error.status >= CLIENT_ERROR_STATUS.min &&
    error.status <= CLIENT_ERROR_STATUS.max;
  return !clientError && failuresSoFar < MAX_RETRIES;
}

/**
 * Global TanStack Query cache configuration (the same QueryClient as in React).
 * Each subject's cache (keys, hooks) lives in each feature's data-access;
 * only the rules that apply to the whole app live here.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        retry: shouldRetry,
      },
    },
  });
}
