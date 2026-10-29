import { ROLE } from './auth.enums';

/** App screens the authentication flow navigates to (the URLs, kept in Portuguese). */
export const AUTH_PATHS = {
  home: '/inicio',
  login: '/login',
  loginError: '/erro-login',
  forbidden: '/sem-permissao',
  signedOut: '/saiu',
} as const;

/** Screen used when the requested destination is missing or not internal. */
export const DEFAULT_DESTINATION = AUTH_PATHS.home;

/** Query param that carries where the user wanted to go (kept in Portuguese: it is part of the URL). */
export const RETURN_TO_PARAM = 'voltarPara';

/** Remembers when the app sent the user to the login backend (loop protection). */
export const LOGIN_ATTEMPT_KEY = 'supermercado.login.attempt';

/** Coming back without a session sooner than this = the backend login failed, don't try again. */
export const LOGIN_LOOP_WINDOW_MS = 10_000;

/** Endpoints that only exist in the mock API (src/mocks/mock-auth.interceptor.ts). */
export const MOCK_AUTH_URLS = {
  login: '/mock-auth/login',
  logout: '/mock-auth/logout',
} as const;

/** Persona used when the login screen doesn't pick one. */
export const DEFAULT_PERSONA = ROLE.admin;
