import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { EXPECTED_STATUSES } from '@core/logging/logging.tokens';
import { Logger } from '@core/logging/logger';
import { firstValueFrom } from 'rxjs';
import { type User } from '../auth.types';
import type { AuthGateway } from './auth-gateway';

/** A Promise that never settles: the page is leaving (redirect), nothing after it should run. */
const pageLeaving = () => new Promise<never>(() => undefined);

/**
 * Real backend (BFF). With Azure AD the flow is:
 *
 *   1. signIn()  → navigates to auth.urls.login?returnUrl=/produtos
 *   2. the backend redirects to login.microsoftonline.com
 *   3. Microsoft comes back to the backend, which creates the HttpOnly session cookie
 *   4. the backend redirects to returnUrl; the app opens and fetchUser() answers 200
 *
 * The front end never touches a token: the browser sends the cookie on its own.
 */
@Injectable({ providedIn: 'root' })
export class BffAuthGateway implements AuthGateway {
  protected readonly http = inject(HttpClient);
  protected readonly urls = inject(APP_CONFIG).auth.urls;
  readonly #document = inject(DOCUMENT);
  readonly #log = inject(Logger).withContext('auth');

  async fetchUser(): Promise<User | null> {
    try {
      // A 401 here means "nobody signed in": a normal response, not a warning in the log.
      const context = new HttpContext().set(EXPECTED_STATUSES, [401]);
      return await firstValueFrom(this.http.get<User>(this.urls.user, { context }));
    } catch (error) {
      // 401 = not signed in (normal response). Other errors: log and treat as not signed in.
      if (!(error instanceof HttpErrorResponse && error.status === 401)) {
        this.#log.error('could not check the session', error);
      }
      return null;
    }
  }

  signIn(returnTo: string): Promise<void> {
    this.#document.location.assign(`${this.urls.login}?returnUrl=${encodeURIComponent(returnTo)}`);
    return pageLeaving();
  }

  signOut(): Promise<void> {
    this.#document.location.assign(this.urls.logout);
    return pageLeaving();
  }
}
