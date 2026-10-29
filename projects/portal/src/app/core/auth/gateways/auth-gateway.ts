import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { AUTH_MODE } from '@core/config/app-config.enums';
import { type User } from '../auth.types';
import { BffAuthGateway } from './bff-auth-gateway';
import { LazyMsalAuthGateway } from './lazy-msal-auth-gateway';
import { MockAuthGateway } from './mock-auth-gateway';

/**
 * How the app talks to whoever authenticates. The rest of the app only knows the `Auth` service;
 * switching mock ↔ bff ↔ msal is just changing `auth.mode` in the environment.
 */
@Injectable({
  providedIn: 'root',
  useFactory: (): AuthGateway => {
    switch (inject(APP_CONFIG).auth.mode) {
      case AUTH_MODE.mock:
        return inject(MockAuthGateway);
      case AUTH_MODE.bff:
        return inject(BffAuthGateway);
      case AUTH_MODE.msal:
        // Lazy: MSAL (~320 kB) is only downloaded when this mode is used.
        return inject(LazyMsalAuthGateway);
    }
  },
})
export abstract class AuthGateway {
  /** Who is signed in right now, or null. Runs before the 1st route (provideAuth). */
  abstract fetchUser(): Promise<User | null>;
  /** Starts the sign-in. `persona` only exists in mock mode. */
  abstract signIn(returnTo: string, persona?: string): Promise<void>;
  abstract signOut(): Promise<void>;
}
