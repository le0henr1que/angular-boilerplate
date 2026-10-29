import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PERSONA, MOCK_AUTH_URLS } from '../auth.constants';
import { BffAuthGateway } from './bff-auth-gateway';

/**
 * Same as the real BFF in everything except login/logout: instead of redirecting to Microsoft,
 * it asks the mock API to create/delete the session cookie. `fetchUser()` is inherited:
 * the same GET auth.urls.user, answered by the mock from the cookie.
 */
@Injectable({ providedIn: 'root' })
export class MockAuthGateway extends BffAuthGateway {
  override async signIn(_returnTo: string, persona: string = DEFAULT_PERSONA): Promise<void> {
    await firstValueFrom(this.http.post(MOCK_AUTH_URLS.login, { persona }));
  }

  override async signOut(): Promise<void> {
    await firstValueFrom(this.http.post(MOCK_AUTH_URLS.logout, null));
  }
}
