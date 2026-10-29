import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { provideTestAppConfig, TEST_APP_CONFIG } from '@testing/test-config';
import { Auth } from '../auth';
import { MSAL } from '../msal/msal.tokens';
import { msalTokenInterceptor } from './msal-token.interceptor';

describe('msalTokenInterceptor (Bearer for the API)', () => {
  const auth = { sessionExpired: vi.fn() };
  const acquireTokenSilent = vi.fn();
  const account = { homeAccountId: 'home-1' };
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    acquireTokenSilent.mockResolvedValue({ accessToken: 'token-123' });
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({
          auth: {
            ...TEST_APP_CONFIG.auth,
            mode: 'msal',
            msal: {
              clientId: 'front',
              authority: 'https://login.microsoftonline.com/tenant',
              redirectUri: '/',
              apis: [{ url: '/api', scopes: ['api://api/access'] }],
              cache: 'sessionStorage',
            },
          },
          features: { authentication: true },
        }),
        provideHttpClient(withInterceptors([msalTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: Auth, useValue: auth },
        {
          provide: MSAL,
          useValue: { acquireTokenSilent, getActiveAccount: () => account },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    vi.clearAllMocks();
  });

  it('a call to the API carries the Bearer with its scopes', async () => {
    http.get('/api/produtos').subscribe();
    // The token comes from an MSAL Promise: the request leaves a moment later.
    const req = await vi.waitFor(() => backend.expectOne('/api/produtos'));
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    expect(acquireTokenSilent).toHaveBeenCalledWith({
      scopes: ['api://api/access'],
      account,
    });
  });

  it('other URLs get no token', () => {
    http.get('https://viacep.com.br/ws/01001000/json/').subscribe();
    const req = backend.expectOne('https://viacep.com.br/ws/01001000/json/');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(acquireTokenSilent).not.toHaveBeenCalled();
  });

  it('Microsoft asks to sign in again: ends the session and does not call the API', async () => {
    acquireTokenSilent.mockRejectedValue(
      new InteractionRequiredAuthError('interaction_required', 'correlation-id'),
    );
    http.get('/api/produtos').subscribe();
    await vi.waitFor(() => expect(auth.sessionExpired).toHaveBeenCalled());
    backend.expectNone('/api/produtos');
  });
});
