import { TestBed } from '@angular/core/testing';
import { MsalLoader } from '../msal/msal-loader';
import { LazyMsalAuthGateway } from './lazy-msal-auth-gateway';

describe('LazyMsalAuthGateway (MSAL outside the initial bundle)', () => {
  const user = { id: 'u-1', name: 'Ana', email: 'ana@exemplo.com', roles: [] };
  const real = {
    fetchUser: vi.fn(() => Promise.resolve(user)),
    signIn: vi.fn(() => Promise.resolve()),
    signOut: vi.fn(() => Promise.resolve()),
  };
  const MsalAuthGateway = class {};
  const load = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    load.mockResolvedValue({
      chunk: { MsalAuthGateway },
      injector: { get: (token: unknown) => (token === MsalAuthGateway ? real : null) },
    });
    TestBed.configureTestingModule({
      providers: [{ provide: MsalLoader, useValue: { load } }],
    });
  });

  const gateway = () => TestBed.inject(LazyMsalAuthGateway);

  it('loads MSAL and delegates each call to the real gateway', async () => {
    expect(await gateway().fetchUser()).toEqual(user);
    await gateway().signIn('/produtos');
    await gateway().signOut();

    expect(real.signIn).toHaveBeenCalledWith('/produtos');
    expect(real.signOut).toHaveBeenCalled();
    expect(load).toHaveBeenCalledTimes(3); // MsalLoader reuses the chunk
  });

  it('chunk did not download (network, new deploy): treats it as signed out, without breaking the app', async () => {
    load.mockRejectedValueOnce(new Error('Failed to fetch dynamically imported module'));
    expect(await gateway().fetchUser()).toBeNull();
    expect(real.fetchUser).not.toHaveBeenCalled();
  });
});

describe('MsalLoader', () => {
  it('downloads the chunk once and builds MsalAuthGateway with MSAL in the child injector', async () => {
    const { provideTestAppConfig, TEST_APP_CONFIG } = await import('@testing/test-config');
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({
          auth: {
            ...TEST_APP_CONFIG.auth,
            mode: 'msal',
            msal: {
              clientId: '00000000-0000-0000-0000-000000000000',
              authority: 'https://login.microsoftonline.com/common',
              redirectUri: '/',
              apis: [],
              cache: 'sessionStorage',
            },
          },
        }),
      ],
    });
    const loader = TestBed.inject(MsalLoader);

    const first = await loader.load();
    expect(await loader.load()).toBe(first);
    expect(first.injector.get(first.chunk.MsalAuthGateway)).toBeInstanceOf(
      first.chunk.MsalAuthGateway,
    );
  });
});
