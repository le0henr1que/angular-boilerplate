import { HttpErrorResponse, type HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { Logger } from '../logger';
import { CORRELATION_HEADER } from '../logging.constants';
import { LOG_LEVEL, type LogLevel } from '../logging.enums';
import { EXPECTED_STATUSES } from '../logging.tokens';
import { createId } from '../logging.utils';

/** 2xx and expected statuses: debug. 4xx: warn. 5xx and network (status 0): error. */
function levelForStatus(status: number, expected: readonly number[]): LogLevel {
  if (status < 400 || expected.includes(status)) return LOG_LEVEL.debug;
  if (status === 0 || status >= 500) return LOG_LEVEL.error;
  return LOG_LEVEL.warn;
}

/**
 * One line per HTTP call, when it finishes:
 * `GET /api/produtos → 200 (812 ms)`.
 *
 * Also sends the `X-Correlation-Id` on same-origin calls (URL starting with `/`).
 * On another domain it doesn't: a new header would require enabling CORS on that server.
 *
 * Register it as the FIRST interceptor, to measure the total time and see the final status.
 */
export const logInterceptor: HttpInterceptorFn = (req, next) => {
  const log = inject(Logger).withContext('http');
  const correlationId = createId();
  const sameOrigin = req.url.startsWith('/') && !req.url.startsWith('//');
  const withId = sameOrigin
    ? req.clone({ setHeaders: { [CORRELATION_HEADER]: correlationId } })
    : req;

  const start = performance.now();
  const ms = () => Math.round(performance.now() - start);
  const expected = req.context.get(EXPECTED_STATUSES);
  const call = `${req.method} ${req.url}`;

  return next(withId).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          log.debug(`${call} → ${event.status} (${ms()} ms)`, {
            correlationId,
            ...(req.params.keys().length ? { params: req.params.toString() } : {}),
          });
        }
      },
      error: (error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        const level = levelForStatus(status, expected);
        log[level](`${call} → ${status || 'no response'} (${ms()} ms)`, {
          correlationId,
          reason: error instanceof HttpErrorResponse ? error.message : String(error),
        });
      },
    }),
  );
};
