import { inject, Injectable } from '@angular/core';
import { Logger } from '@core/logging/logger';
import { MsalLoader } from '../msal/msal-loader';
import { type User } from '../auth.types';
import type { AuthGateway } from './auth-gateway';
import type { MsalAuthGateway } from './msal-auth-gateway';

/**
 * `msal` mode without MSAL in the initial bundle: downloads the MSAL chunk on the first call
 * and delegates to the real MsalAuthGateway (see MsalLoader).
 */
@Injectable({ providedIn: 'root' })
export class LazyMsalAuthGateway implements AuthGateway {
  readonly #loader = inject(MsalLoader);
  readonly #log = inject(Logger).withContext('auth');

  async #gateway(): Promise<MsalAuthGateway> {
    const done = this.#log.time('MSAL chunk loaded');
    const { injector, chunk } = await this.#loader.load();
    done();
    return injector.get(chunk.MsalAuthGateway);
  }

  async fetchUser(): Promise<User | null> {
    try {
      return await (await this.#gateway()).fetchUser();
    } catch (error) {
      // Only gets here if the chunk didn't download: the gateway itself handles login errors.
      this.#log.error('could not load MSAL', error);
      return null;
    }
  }

  async signIn(returnTo: string): Promise<void> {
    return (await this.#gateway()).signIn(returnTo);
  }

  async signOut(): Promise<void> {
    return (await this.#gateway()).signOut();
  }
}
