import { HttpErrorResponse } from '@angular/common/http';
import { createQueryClient, shouldRetry } from './query-client';
import { MAX_RETRIES, STALE_TIME_MS } from './query.constants';

describe('shouldRetry', () => {
  it.each([400, 401, 403, 404, 422])('does not retry on client error %i', (status) => {
    expect(shouldRetry(0, new HttpErrorResponse({ status }))).toBe(false);
  });

  it.each([0, 500, 502, 503])('retries on error %i (network/server)', (status) => {
    expect(shouldRetry(0, new HttpErrorResponse({ status }))).toBe(true);
  });

  it('retries on non-HTTP errors', () => {
    expect(shouldRetry(0, new Error('timeout'))).toBe(true);
  });

  it(`stops after ${MAX_RETRIES} retries`, () => {
    const error = new HttpErrorResponse({ status: 500 });
    expect(shouldRetry(MAX_RETRIES - 1, error)).toBe(true);
    expect(shouldRetry(MAX_RETRIES, error)).toBe(false);
  });
});

describe('createQueryClient', () => {
  it('uses a 1 minute staleTime and the retry policy', () => {
    const { queries } = createQueryClient().getDefaultOptions();
    expect(queries?.staleTime).toBe(STALE_TIME_MS);
    expect(queries?.retry).toBe(shouldRetry);
  });

  it('creates a new cache on each call', () => {
    expect(createQueryClient()).not.toBe(createQueryClient());
  });
});
