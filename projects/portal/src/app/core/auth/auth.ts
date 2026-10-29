import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router, type UrlTree } from '@angular/router';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { injectFeatures } from '@core/config/feature-flags';
import { Logger } from '@core/logging/logger';
import { AUTH_MODE } from '@core/config/app-config.enums';
import {
  AUTH_PATHS,
  LOGIN_ATTEMPT_KEY,
  LOGIN_LOOP_WINDOW_MS,
  RETURN_TO_PARAM,
} from './auth.constants';
import { type Role } from './auth.enums';
import { type User } from './auth.types';
import { internalDestination } from './auth.utils';
import { AuthGateway } from './gateways/auth-gateway';

/**
 * Single source of truth about "who is signed in". Guards, interceptor, menu and screens read it.
 * It doesn't know whether the login is mock or Azure AD: that's the AuthGateway's job.
 */
@Injectable({ providedIn: 'root' })
export class Auth {
  readonly #gateway = inject(AuthGateway);
  readonly #router = inject(Router);
  readonly #document = inject(DOCUMENT);
  readonly #features = injectFeatures();
  readonly #user = signal<User | null>(null);
  readonly #mode = inject(APP_CONFIG).auth.mode;
  readonly #log = inject(Logger).withContext('auth');
  readonly #leavingApp = signal(false);

  readonly user = this.#user.asReadonly();
  /**
   * true when the page is heading to the Microsoft login/logout (bff/msal). The App shows the
   * global loading instead of a half-rendered screen until the browser changes pages.
   */
  readonly leavingApp = this.#leavingApp.asReadonly();
  readonly authenticated = computed(() => this.#user() !== null);
  /** false when the `authentication` flag is off: the app is open. */
  readonly enabled = this.#features.authentication;
  /**
   * Only the simulated (mock) login has a login screen in the app (pick the persona).
   * In bff and msal modes Microsoft shows the login: the app redirects straight there.
   */
  readonly hasLoginScreen = this.#mode === AUTH_MODE.mock;

  /** Runs once at startup (provideAuth), before the first route. */
  async loadSession(): Promise<void> {
    if (!this.enabled) {
      this.#log.debug('authentication off (`authentication` flag): open app, no login');
      return;
    }
    this.#log.debug('checking the session', { mode: this.#mode });
    const done = this.#log.time('session checked');
    const user = await this.#gateway.fetchUser();
    done();
    this.#user.set(user);
    if (user) {
      forgetAttempt();
      // Only id and roles: name and email are personal data and don't go to the log.
      this.#log.info('active session', { user: user.id, roles: user.roles });
      if (user.roles.length === 0 && this.#features.roleControl) {
        this.#log.warn(
          'signed-in user without any known role: will only see screens without requireRole',
          {
            user: user.id,
          },
        );
      }
    } else {
      this.#log.debug('no session: the gates will ask for login');
    }
  }

  /** The user's actual role (ignores flags). */
  hasRole(...roles: Role[]): boolean {
    const mine = this.#user()?.roles ?? [];
    return roles.some((role) => mine.includes(role));
  }

  /** Access rule taking the flags into account: use this one in guards and in the menu. */
  canAccess(...roles: Role[]): boolean {
    if (!this.enabled || !this.#features.roleControl) return true;
    return this.hasRole(...roles);
  }

  /**
   * Takes a signed-out user to the login, remembering where they wanted to go.
   * - mock: returns the /login screen URL (the guard redirects to it);
   * - bff/msal: the page leaves for Microsoft (through the backend in bff, directly in msal). The
   *   Promise never settles, so navigation stays put (no flashing 404) until the page leaves.
   *   If the user just came back from there without a session, returns /erro-login instead of looping.
   */
  goToLogin(returnTo: string): UrlTree | Promise<never> {
    const destination = internalDestination(returnTo);
    if (destination !== returnTo) {
      this.#log.warn('login destination outside the app was discarded (open redirect)', {
        requested: returnTo,
        used: destination,
      });
    }
    if (this.hasLoginScreen) {
      this.#log.debug('no session: going to the simulated login screen', { destination });
      return this.#router.createUrlTree([AUTH_PATHS.login], {
        queryParams: { [RETURN_TO_PARAM]: destination },
      });
    }
    if (triedRecently()) {
      this.#log.warn(
        'came back from login without a session right after trying: showing /erro-login (loop protection)',
        { mode: this.#mode, destination, windowMs: LOGIN_LOOP_WINDOW_MS },
      );
      return this.#router.createUrlTree([AUTH_PATHS.loginError], {
        queryParams: { [RETURN_TO_PARAM]: destination },
      });
    }
    return this.#startBackendLogin(destination);
  }

  async signIn(returnTo: string, persona?: string): Promise<void> {
    const destination = internalDestination(returnTo);
    if (!this.hasLoginScreen) return this.#startBackendLogin(destination); // the page leaves here
    await this.#gateway.signIn(destination, persona);
    await this.loadSession();
    await this.#router.navigateByUrl(destination);
  }

  /** mock: back to the login screen. bff: the backend ends the session and redirects to /saiu. */
  async signOut(): Promise<void> {
    this.#log.info('signing out', { mode: this.#mode, user: this.#user()?.id });
    if (!this.hasLoginScreen) this.#markLeaving(); // bff/msal: logout happens at Microsoft
    await this.#gateway.signOut(); // in bff mode the page leaves here
    this.#user.set(null);
    await this.#router.navigateByUrl(AUTH_PATHS.login);
  }

  /** Called by the interceptors when the session ends (API answered 401, or MSAL asks to sign in again). */
  sessionExpired(): void {
    if (!this.#user()) return;
    this.#log.warn('session expired mid-use: asking to sign in again', {
      user: this.#user()?.id,
      route: this.#router.url,
    });
    this.#user.set(null);
    const destination = this.goToLogin(this.#router.url);
    if (!(destination instanceof Promise)) void this.#router.navigateByUrl(destination);
  }

  #startBackendLogin(destination: string): Promise<never> {
    // The page is about to leave: turn on "Preserve log" in DevTools to keep these lines.
    this.#log.info('redirecting to the Microsoft login', { mode: this.#mode, destination });
    rememberAttempt();
    this.#markLeaving();
    void this.#gateway.signIn(destination);
    return new Promise<never>(() => undefined);
  }

  #markLeaving(): void {
    this.#leavingApp.set(true);
    // Coming back from Microsoft with the "back" button may restore this page from the bfcache,
    // frozen while loading (the navigation that waited for the redirect never ends). Reload from scratch.
    this.#document.defaultView?.addEventListener(
      'pageshow',
      (event) => {
        if (event.persisted) this.#document.location.reload();
      },
      { once: true },
    );
  }
}

// sessionStorage may be blocked (browser policy): without it, only the loop protection is lost.
function rememberAttempt(): void {
  try {
    sessionStorage.setItem(LOGIN_ATTEMPT_KEY, String(Date.now()));
  } catch {
    /* no storage */
  }
}

function forgetAttempt(): void {
  try {
    sessionStorage.removeItem(LOGIN_ATTEMPT_KEY);
  } catch {
    /* no storage */
  }
}

function triedRecently(): boolean {
  try {
    const last = Number(sessionStorage.getItem(LOGIN_ATTEMPT_KEY));
    return last > 0 && Date.now() - last < LOGIN_LOOP_WINDOW_MS;
  } catch {
    return false;
  }
}
