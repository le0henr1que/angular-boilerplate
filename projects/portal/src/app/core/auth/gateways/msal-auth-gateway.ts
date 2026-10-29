import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { type AccountInfo } from '@azure/msal-browser';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { Logger } from '@core/logging/logger';
import { type Role, ROLES } from '../auth.enums';
import { type User } from '../auth.types';
import { internalDestination } from '../auth.utils';
import { MSAL } from '../msal/msal.tokens';
import type { AuthGateway } from './auth-gateway';

/** A Promise that never settles: the page is leaving (redirect), nothing after it should run. */
const pageLeaving = () => new Promise<never>(() => undefined);

/**
 * Microsoft account → app User.
 * Roles come from the id token's `roles` claim: they are the app registration's "App roles",
 * assigned to users/groups in Enterprise applications. Unknown roles are ignored.
 */
export function toUser(account: AccountInfo): User {
  const roles = account.idTokenClaims?.roles ?? [];
  return {
    id: account.localAccountId || account.homeAccountId,
    name: account.name ?? account.username,
    email: account.username,
    roles: roles.filter((role): role is Role => ROLES.includes(role as Role)),
  };
}

/**
 * Azure AD / Entra ID in the front end, with MSAL. The flow:
 *
 *   1. signIn('/produtos') → loginRedirect: the page goes to login.microsoftonline.com
 *      carrying the destination in `state`
 *   2. Microsoft comes back to auth.msal.redirectUri with the code in the URL
 *   3. the app opens again; fetchUser() (before the 1st route) exchanges the code for tokens,
 *      sets the URL to '/produtos' and returns the user
 *   4. the gates let it through and the screen opens; msalTokenInterceptor sends the token to the API
 */
@Injectable({ providedIn: 'root' })
export class MsalAuthGateway implements AuthGateway {
  readonly #msal = inject(MSAL);
  readonly #document = inject(DOCUMENT);
  readonly #log = inject(Logger).withContext('auth');
  readonly #config = inject(APP_CONFIG).auth.msal;
  readonly #scopes = (this.#config?.apis ?? []).flatMap((api) => api.scopes);

  async fetchUser(): Promise<User | null> {
    // Microsoft returns the code in the URL (#code=... or ?code=..., depending on responseMode).
    // We only log WHETHER it came, never the value: the code works as a credential until it becomes a token.
    const location = this.#document.defaultView?.location;
    const returningFromMicrosoft = /[#&?](code|error)=/.test(
      `${location?.search}${location?.hash}`,
    );
    try {
      const initDone = this.#log.time('MSAL initialized');
      await this.#msal.initialize();
      initDone();

      if (returningFromMicrosoft) {
        this.#log.debug('URL has the Microsoft response: exchanging the code for tokens');
      }
      // navigateToLoginRequestUrl: false → MSAL doesn't reload the page; we set the URL to the
      // destination ourselves (step 3), before the router's 1st navigation.
      const redirectDone = this.#log.time('redirect response processed');
      const result = await this.#msal.handleRedirectPromise({
        navigateToLoginRequestUrl: false,
      });
      redirectDone();

      const instance = this.#msal;
      const accounts = instance.getAllAccounts();
      const account = result?.account ?? instance.getActiveAccount() ?? accounts[0] ?? null;
      if (!account) {
        this.#log.debug('no Microsoft account in the cache: user not signed in', {
          returningFromMicrosoft,
        });
        return null;
      }

      const source = result?.account ? 'redirect' : 'cache';
      instance.setActiveAccount(account);
      if (accounts.length > 1) {
        this.#log.warn('more than one Microsoft account in the cache: using the first', {
          accounts: accounts.length,
        });
      }

      const user = toUser(account);
      const roles = account.idTokenClaims?.roles ?? [];
      const ignored = roles.filter((role) => !ROLES.includes(role as Role));
      this.#log.debug('Microsoft account found', {
        source,
        tenant: account.tenantId,
        roles,
        expiresAt: expiration(account),
      });
      if (ignored.length > 0) {
        this.#log.warn('token roles without a matching app role were ignored', {
          ignored,
          known: ROLES,
        });
      }

      if (result) {
        this.#log.info('Microsoft sign-in completed', {
          user: user.id,
          roles: user.roles,
          scopes: result.scopes,
        });
      }
      if (result?.state) {
        const destination = internalDestination(result.state);
        this.#log.debug('going back to where the user wanted to go', { destination });
        this.#document.defaultView?.history.replaceState(null, '', destination);
      }
      return user;
    } catch (error) {
      // E.g. the user cancelled, no permission on the app, redirectUri not registered.
      // Without a user, Auth shows /erro-login instead of looping.
      this.#log.error('could not complete the Microsoft sign-in', error);
      this.#log.warn('sign-in failure details', { returningFromMicrosoft, ...msalDetails(error) });
      return null;
    }
  }

  signIn(returnTo: string): Promise<void> {
    // clientId and authority aren't secret (they go in the login URL): they help find bad config.
    this.#log.debug('opening the Microsoft login (loginRedirect)', {
      authority: this.#config?.authority,
      clientId: this.#config?.clientId,
      redirectUri: this.#config?.redirectUri,
      scopes: this.#scopes,
      state: returnTo,
    });
    // Ask for the API scopes right away: consent happens at sign-in, not on the 1st call.
    // Calling initialize() again is safe (it only runs once) and guarantees the order MSAL requires.
    void this.#msal
      .initialize()
      .then(() => this.#msal.loginRedirect({ scopes: this.#scopes, state: returnTo }))
      .catch((error: unknown) => {
        // E.g. endpoints_resolution_error = invalid authority (tenant doesn't exist).
        this.#log.error('could not open the Microsoft login', error);
        this.#log.warn('details of the failure to open the login', {
          authority: this.#config?.authority,
          ...msalDetails(error),
        });
      });
    return pageLeaving();
  }

  signOut(): Promise<void> {
    this.#log.debug('signing out of the Microsoft account (logoutRedirect)');
    this.#msal
      .logoutRedirect({ account: this.#msal.getActiveAccount() })
      .catch((error: unknown) => this.#log.error('failed to sign out', error));
    return pageLeaving();
  }
}

/** When the id token expires, in ISO (the `exp` claim, in seconds). */
function expiration(account: AccountInfo): string | undefined {
  const exp = account.idTokenClaims?.exp;
  return typeof exp === 'number' ? new Date(exp * 1000).toISOString() : undefined;
}

/**
 * Diagnostic fields of MSAL errors (AuthError). `errorCode` says what happened
 * (e.g. user_cancelled, endpoints_resolution_error) and `correlationId` is what Microsoft
 * support asks for to find the request in the Entra ID logs.
 */
function msalDetails(error: unknown): Record<string, unknown> {
  if (typeof error !== 'object' || error === null) return {};
  const { errorCode, subError, correlationId } = error as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries({ errorCode, subError, correlationId }).filter(([, v]) => v),
  );
}
