import { DOCUMENT } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG, type AppConfig } from '@core/config/app-config';
import { BffAuthGateway } from './bff-auth-gateway';

describe('BffAuthGateway (backend real, ex.: Azure AD)', () => {
  const location = { assign: vi.fn() };
  const configAuth = {
    modo: 'bff' as const,
    urls: { login: '/bff/login', logout: '/bff/logout', usuario: '/bff/user' },
    headerCsrf: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // O gateway só lê auth.urls: basta entregar esse pedaço da config.
        { provide: APP_CONFIG, useValue: { auth: configAuth } as AppConfig },
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DOCUMENT, useValue: { location } },
      ],
    });
  });

  afterEach(() => vi.clearAllMocks());

  it('entrar redireciona a página para o login do backend com o returnUrl', () => {
    void TestBed.inject(BffAuthGateway).entrar('/produtos?q=joão');
    expect(location.assign).toHaveBeenCalledWith(
      '/bff/login?returnUrl=%2Fprodutos%3Fq%3Djo%C3%A3o',
    );
  });

  it('sair redireciona para o logout do backend', () => {
    void TestBed.inject(BffAuthGateway).sair();
    expect(location.assign).toHaveBeenCalledWith('/bff/logout');
  });

  it('buscarUsuario devolve o usuário (200) ou null (401)', async () => {
    const gateway = TestBed.inject(BffAuthGateway);
    const backend = TestBed.inject(HttpTestingController);

    const logado = gateway.buscarUsuario();
    backend.expectOne('/bff/user').flush({ id: '1', nome: 'Ana', email: 'a@x', papeis: [] });
    expect((await logado)?.nome).toBe('Ana');

    const anonimo = gateway.buscarUsuario();
    backend.expectOne('/bff/user').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(await anonimo).toBeNull();
  });
});
