import { DOCUMENT } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { type AppConfig } from '@core/config/app-config.types';
import { BffAuthGateway } from './bff-auth-gateway';

describe('BffAuthGateway (real backend, e.g. Azure AD)', () => {
  const location = { assign: vi.fn() };
  const authConfig = {
    mode: 'bff' as const,
    urls: { login: '/bff/login', logout: '/bff/logout', user: '/bff/user' },
    csrfHeader: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // The gateway only reads auth.urls: handing over that piece of the config is enough.
        { provide: APP_CONFIG, useValue: { auth: authConfig } as AppConfig },
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DOCUMENT, useValue: { location } },
      ],
    });
  });

  afterEach(() => vi.clearAllMocks());

  it('signIn redirects the page to the backend login with the returnUrl', () => {
    void TestBed.inject(BffAuthGateway).signIn('/produtos?q=joão');
    expect(location.assign).toHaveBeenCalledWith(
      '/bff/login?returnUrl=%2Fprodutos%3Fq%3Djo%C3%A3o',
    );
  });

  it('signOut redirects to the backend logout', () => {
    void TestBed.inject(BffAuthGateway).signOut();
    expect(location.assign).toHaveBeenCalledWith('/bff/logout');
  });

  it('fetchUser returns the user (200) or null (401)', async () => {
    const gateway = TestBed.inject(BffAuthGateway);
    const backend = TestBed.inject(HttpTestingController);

    const signedIn = gateway.fetchUser();
    backend.expectOne('/bff/user').flush({ id: '1', name: 'Ana', email: 'a@x', roles: [] });
    expect((await signedIn)?.name).toBe('Ana');

    const anonymous = gateway.fetchUser();
    backend.expectOne('/bff/user').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(await anonymous).toBeNull();
  });
});
