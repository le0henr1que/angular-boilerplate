import { HttpErrorResponse, type HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MOCK_AUTH_URLS } from '@core/auth/auth.constants';
import { MOCK_PERSONAS } from '@core/auth/gateways/mock-personas';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { delay, of, throwError } from 'rxjs';
import { clearMockSession, readMockSession, writeMockSession } from './mock-session';

const LATENCY_MS = 150;

const respond = <T>(status: number, body: T) =>
  of(new HttpResponse({ status, body })).pipe(delay(LATENCY_MS));
const error = (status: number, url: string) =>
  throwError(() => new HttpErrorResponse({ status, url })).pipe(delay(LATENCY_MS));

/**
 * Plays the BFF (authentication backend) while it doesn't exist.
 * Only registered with `auth.mode: 'mock'` (see app.config.ts).
 *
 *   POST /mock-auth/login  { persona }  → creates the session cookie
 *   POST /mock-auth/logout              → deletes the cookie
 *   GET  auth.urls.user                 → 200 with the cookie's user, or 401
 */
export const mockAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const { auth } = inject(APP_CONFIG);

  if (req.method === 'POST' && req.url === MOCK_AUTH_URLS.login) {
    const { persona } = req.body as { persona: string };
    if (!MOCK_PERSONAS.some((p) => p.id === persona)) return error(400, req.url);
    writeMockSession(persona);
    return respond(204, null);
  }

  if (req.method === 'POST' && req.url === MOCK_AUTH_URLS.logout) {
    clearMockSession();
    return respond(204, null);
  }

  if (req.method === 'GET' && req.url === auth.urls.user) {
    const session = readMockSession();
    return session ? respond(200, session.user) : error(401, req.url);
  }

  return next(req);
};
