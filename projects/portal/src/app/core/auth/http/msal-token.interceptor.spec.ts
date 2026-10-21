import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { provideTestAppConfig, TEST_APP_CONFIG } from '@testing/test-config';
import { Auth } from '../auth';
import { MSAL } from '../msal/provide-msal';
import { msalTokenInterceptor } from './msal-token.interceptor';

describe('msalTokenInterceptor (Bearer para a API)', () => {
  const auth = { sessaoExpirou: vi.fn() };
  const acquireTokenSilent = vi.fn();
  const conta = { homeAccountId: 'home-1' };
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    acquireTokenSilent.mockResolvedValue({ accessToken: 'token-123' });
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({
          auth: {
            ...TEST_APP_CONFIG.auth,
            modo: 'msal',
            msal: {
              clientId: 'front',
              authority: 'https://login.microsoftonline.com/tenant',
              redirectUri: '/',
              apis: [{ url: '/api', scopes: ['api://api/acesso'] }],
              cache: 'sessionStorage',
            },
          },
          features: { autenticacao: true },
        }),
        provideHttpClient(withInterceptors([msalTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: Auth, useValue: auth },
        {
          provide: MSAL,
          useValue: { acquireTokenSilent, getActiveAccount: () => conta },
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

  it('chamada para a API leva o Bearer com os scopes dela', async () => {
    http.get('/api/produtos').subscribe();
    // O token vem de uma Promise do MSAL: a requisição sai um instante depois.
    const req = await vi.waitFor(() => backend.expectOne('/api/produtos'));
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    expect(acquireTokenSilent).toHaveBeenCalledWith({
      scopes: ['api://api/acesso'],
      account: conta,
    });
  });

  it('outras URLs não recebem token', () => {
    http.get('https://viacep.com.br/ws/01001000/json/').subscribe();
    const req = backend.expectOne('https://viacep.com.br/ws/01001000/json/');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(acquireTokenSilent).not.toHaveBeenCalled();
  });

  it('Microsoft pede login de novo: encerra a sessão e não chama a API', async () => {
    acquireTokenSilent.mockRejectedValue(
      new InteractionRequiredAuthError('interaction_required', 'id-de-correlacao'),
    );
    http.get('/api/produtos').subscribe();
    await vi.waitFor(() => expect(auth.sessaoExpirou).toHaveBeenCalled());
    backend.expectNone('/api/produtos');
  });
});
