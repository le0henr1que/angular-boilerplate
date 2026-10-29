import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { type AccountInfo, type AuthenticationResult } from '@azure/msal-browser';
import { provideTestAppConfig, TEST_APP_CONFIG } from '@testing/test-config';
import { MSAL } from '../msal/msal.tokens';
import { MsalAuthGateway, toUser } from './msal-auth-gateway';

const account = (roles?: string[]): AccountInfo =>
  ({
    homeAccountId: 'home-1',
    localAccountId: 'oid-1',
    environment: 'login.microsoftonline.com',
    tenantId: 'tenant',
    username: 'ana@exemplo.com',
    name: 'Ana Admin',
    idTokenClaims: roles ? { roles } : {},
  }) as AccountInfo;

describe('MsalAuthGateway (Azure AD with MSAL)', () => {
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
            mode: 'msal',
            msal: {
              clientId: 'front',
              authority: 'https://login.microsoftonline.com/tenant',
              redirectUri: '/',
              apis: [{ url: '/api', scopes: ['api://api/access'] }],
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

  it('no account in the cache: nobody signed in', async () => {
    expect(await gateway().fetchUser()).toBeNull();
    expect(msal.initialize).toHaveBeenCalled();
  });

  it('account already in the cache (F5): returns the user and marks the account active', async () => {
    msal.getAllAccounts.mockReturnValue([account(['operator'])]);
    expect(await gateway().fetchUser()).toEqual({
      id: 'oid-1',
      name: 'Ana Admin',
      email: 'ana@exemplo.com',
      roles: ['operator'],
    });
    expect(msal.setActiveAccount).toHaveBeenCalled();
    expect(replaceState).not.toHaveBeenCalled();
  });

  it('coming back from Microsoft: sets the URL to the destination kept in the state', async () => {
    msal.handleRedirectPromise.mockResolvedValue({
      account: account(),
      state: '/produtos?q=1',
    } as AuthenticationResult);
    await gateway().fetchUser();
    expect(replaceState).toHaveBeenCalledWith(null, '', '/produtos?q=1');
  });

  it('a state with an external URL becomes /inicio (open redirect)', async () => {
    msal.handleRedirectPromise.mockResolvedValue({
      account: account(),
      state: 'https://malicious-site.com',
    } as AuthenticationResult);
    await gateway().fetchUser();
    expect(replaceState).toHaveBeenCalledWith(null, '', '/inicio');
  });

  it('error coming back from Microsoft: treated as signed out', async () => {
    msal.handleRedirectPromise.mockRejectedValue(new Error('access_denied'));
    expect(await gateway().fetchUser()).toBeNull();
  });

  it('signIn: loginRedirect with the destination in the state and the API scopes', async () => {
    void gateway().signIn('/produtos');
    await vi.waitFor(() => expect(msal.loginRedirect).toHaveBeenCalled());
    expect(msal.loginRedirect).toHaveBeenCalledWith({
      scopes: ['api://api/access'],
      state: '/produtos',
    });
  });

  it('signOut: logoutRedirect of the active account', () => {
    const active = account();
    msal.getActiveAccount.mockReturnValue(active);
    void gateway().signOut();
    expect(msal.logoutRedirect).toHaveBeenCalledWith({ account: active });
  });

  it('roles: only the ones the app knows', () => {
    expect(toUser(account(['admin', 'Global.Reader', 'customer'])).roles).toEqual([
      'admin',
      'customer',
    ]);
    expect(toUser(account()).roles).toEqual([]);
  });
});
