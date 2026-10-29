import { MOCK_PERSONAS } from '@core/auth/gateways/mock-personas';
import { type MockPersona } from '@core/auth/auth.types';

/**
 * Session cookie of the MOCK API.
 *
 * On the real backend the cookie is HttpOnly: JavaScript can't read or write it.
 * Here there is no server, so the mock plays its role and uses document.cookie.
 * Only the mocks/ folder touches the cookie; the app never reads it, it only calls GET auth.urls.user.
 */
const COOKIE = 'supermercado_mock_session';

export function readMockSession(): MockPersona | null {
  const value = document.cookie
    .split('; ')
    .find((pair) => pair.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  return MOCK_PERSONAS.find((p) => p.id === decodeURIComponent(value ?? '')) ?? null;
}

/** Session cookie (no max-age): gone when the browser closes, like the backend's. */
export function writeMockSession(personaId: string): void {
  document.cookie = `${COOKIE}=${encodeURIComponent(personaId)}; path=/; SameSite=Lax`;
}

export function clearMockSession(): void {
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
