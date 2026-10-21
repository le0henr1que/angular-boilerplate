import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { type AccountInfo, type AuthenticationResult } from '@azure/msal-browser';
import { provideTestAppConfig, TEST_APP_CONFIG } from '@testing/test-config';
import { MSAL } from '../msal/provide-msal';
import { MsalAuthGateway, paraUsuario } from './msal-auth-gateway';

const conta = (roles?: string[]): AccountInfo =>
  ({
    homeAccountId: 'home-1',
    localAccountId: 'oid-1',
    environment: 'login.microsoftonline.com',
    tenantId: 'tenant',
    username: 'ana@exemplo.com',
    name: 'Ana Admin',
    idTokenClaims: roles ? { roles } : {},
  }) as AccountInfo;

describe('MsalAuthGateway (Azure AD com MSAL)', () => {
  const replaceState = vi.fn();
  let msal: {
    initialize: ReturnType<typeof vi.fn>;
    handleRedirectPromise: ReturnType<typeof vi.fn>;
    loginRedirect: ReturnType<typeof vi.fn>;
    logoutRedirect: ReturnType<typeof vi.fn>;
    getActiveAccount: ReturnType<typeof vi.fn>;
    getAllAccounts: ReturnType<typeof vi.fn>;
    setActiveAccount: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    msal = {
      initialize: vi.fn(() => Promise.resolve()),
      handleRedirectPromise: vi.fn(() => Promise.resolve(null)),
      loginRedirect: vi.fn(() => Promise.resolve()),
      logoutRedirect: vi.fn(() => Promise.resolve()),
      getActiveAccount: vi.fn(() => null),
      getAllAccounts: vi.fn(() => []),
      setActiveAccount: vi.fn(),
    };
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
        }),
        { provide: MSAL, useValue: msal },
        { provide: DOCUMENT, useValue: { defaultView: { history: { replaceState } } } },
      ],
    });
  });

  afterEach(() => vi.clearAllMocks());

  const gateway = () => TestBed.inject(MsalAuthGateway);

  it('sem conta no cache: ninguém logado', async () => {
    expect(await gateway().buscarUsuario()).toBeNull();
    expect(msal.initialize).toHaveBeenCalled();
  });

  it('conta já no cache (F5): devolve o usuário e marca a conta ativa', async () => {
    msal.getAllAccounts.mockReturnValue([conta(['operador'])]);
    expect(await gateway().buscarUsuario()).toEqual({
      id: 'oid-1',
      nome: 'Ana Admin',
      email: 'ana@exemplo.com',
      papeis: ['operador'],
    });
    expect(msal.setActiveAccount).toHaveBeenCalled();
    expect(replaceState).not.toHaveBeenCalled();
  });

  it('voltando da Microsoft: põe a URL no destino guardado no state', async () => {
    msal.handleRedirectPromise.mockResolvedValue({
      account: conta(),
      state: '/produtos?q=1',
    } as AuthenticationResult);
    await gateway().buscarUsuario();
    expect(replaceState).toHaveBeenCalledWith(null, '', '/produtos?q=1');
  });

  it('state com URL externa vira /inicio (open redirect)', async () => {
    msal.handleRedirectPromise.mockResolvedValue({
      account: conta(),
      state: 'https://site-malicioso.com',
    } as AuthenticationResult);
    await gateway().buscarUsuario();
    expect(replaceState).toHaveBeenCalledWith(null, '', '/inicio');
  });

  it('erro na volta da Microsoft: trata como não logado', async () => {
    msal.handleRedirectPromise.mockRejectedValue(new Error('access_denied'));
    expect(await gateway().buscarUsuario()).toBeNull();
  });

  it('entrar: loginRedirect com o destino no state e os scopes da API', async () => {
    void gateway().entrar('/produtos');
    await vi.waitFor(() => expect(msal.loginRedirect).toHaveBeenCalled());
    expect(msal.loginRedirect).toHaveBeenCalledWith({
      scopes: ['api://api/acesso'],
      state: '/produtos',
    });
  });

  it('sair: logoutRedirect da conta ativa', () => {
    const ativa = conta();
    msal.getActiveAccount.mockReturnValue(ativa);
    void gateway().sair();
    expect(msal.logoutRedirect).toHaveBeenCalledWith({ account: ativa });
  });

  it('papéis: só os conhecidos pelo app', () => {
    expect(paraUsuario(conta(['admin', 'Leitor.Global', 'cliente'])).papeis).toEqual([
      'admin',
      'cliente',
    ]);
    expect(paraUsuario(conta()).papeis).toEqual([]);
  });
});
