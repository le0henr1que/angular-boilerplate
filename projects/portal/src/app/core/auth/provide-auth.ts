import { type EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { Auth } from './auth';

/**
 * Checks the session (GET auth.urls.user) BEFORE the first route.
 * That way the guards already know who is signed in on F5, without flashing the login screen.
 */
export function provideAuth(): EnvironmentProviders {
  return provideAppInitializer(() => inject(Auth).loadSession());
}
