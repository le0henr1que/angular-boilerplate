import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideTestAppConfig } from '@testing/test-config';
import { Auth } from '../auth';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor (cookie + CSRF + 401)', () => {
  const auth = { sessaoExpirou: vi.fn() };
  let http: HttpClient;
  let backend: HttpTestingController;

  function configurar(autenticacao = true) {
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({ features: { autenticacao } }),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Auth, useValue: auth },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    backend.verify();
    vi.clearAllMocks();
  });

  it('chamadas para a nossa API levam cookie (withCredentials) e o header anti-CSRF', () => {
    configurar();
    http.get('/api/produtos').subscribe();
    const req = backend.expectOne('/api/produtos');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.get('X-CSRF')).toBe('1');
    req.flush([]);
  });

  it('chamadas para outros domínios não levam nada', () => {
    configurar();
    http.get('https://cdn.exemplo.com/dados.json').subscribe();
    const req = backend.expectOne('https://cdn.exemplo.com/dados.json');
    expect(req.request.withCredentials).toBe(false);
    expect(req.request.headers.has('X-CSRF')).toBe(false);
    req.flush({});
  });

  it('401 da API = sessão expirada', () => {
    configurar();
    http.get('/api/produtos').subscribe({ error: () => undefined });
    backend.expectOne('/api/produtos').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.sessaoExpirou).toHaveBeenCalledOnce();
  });

  it('401 na consulta de sessão (/bff/user) é só "não logado", não expiração', () => {
    configurar();
    http.get('/bff/user').subscribe({ error: () => undefined });
    backend.expectOne('/bff/user').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.sessaoExpirou).not.toHaveBeenCalled();
  });

  it('com a flag autenticacao desligada não mexe em nada', () => {
    configurar(false);
    http.get('/api/produtos').subscribe({ error: () => undefined });
    const req = backend.expectOne('/api/produtos');
    expect(req.request.withCredentials).toBe(false);
    req.flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.sessaoExpirou).not.toHaveBeenCalled();
  });
});
