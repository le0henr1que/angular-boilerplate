import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Auth } from '@core/auth/auth';
import { AuthGateway } from '@core/auth/gateways/auth-gateway';
import { type Role } from '@core/auth/auth.enums';
import { ProductsApi } from '@features/products';
import { provideLocalePtBr } from '@testing/locale';
import { TEST_PRODUCTS } from '@testing/products.fixture';
import { provideTestAppConfig, TEST_APP_CONFIG } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { routes } from './app.routes';

/** Same key Auth uses to remember the last login attempt (loop protection). */
const ATTEMPT_KEY = 'supermercado.login.attempt';

/**
 * Production (auth.mode = 'bff', Azure AD): there is no login screen in the app.
 * Signed-out users go straight to the backend (which leads to Microsoft).
 */
describe('App routes with backend login (bff)', () => {
  const url = () => TestBed.inject(Router).url;
  const gateway = { fetchUser: vi.fn(), signIn: vi.fn(), signOut: vi.fn() };

  async function start(role: Role | null) {
    const user = role ? { id: '1', name: 'Teste', email: 't@x', roles: [role] } : null;
    gateway.fetchUser.mockResolvedValue(user);
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({
          auth: { ...TEST_APP_CONFIG.auth, mode: 'bff' },
          features: { authentication: true },
        }),
        provideTestQueryClient(),
        provideLocalePtBr(),
        { provide: AuthGateway, useValue: gateway },
        {
          provide: ProductsApi,
          useValue: { list: vi.fn().mockResolvedValue(TEST_PRODUCTS), get: vi.fn() },
        },
        provideRouter(routes, withComponentInputBinding()),
      ],
    });
    await TestBed.inject(Auth).loadSession(); // what provideAuth() does in the app
    return RouterTestingHarness.create();
  }

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('without a session, goes straight to the backend login keeping the destination', async () => {
    const harness = await start(null);
    // The navigation stays put on purpose (the page is leaving), hence no await.
    void harness.navigateByUrl('/produtos?q=arroz');
    await vi.waitFor(() => expect(gateway.signIn).toHaveBeenCalledWith('/produtos?q=arroz'));
    expect(
      screen.queryByRole('heading', { name: 'Página não encontrada' }),
    ).not.toBeInTheDocument();
    // App uses this to keep the global loading until the page leaves (no flashing).
    expect(TestBed.inject(Auth).leavingApp()).toBe(true);
  });

  it('the Microsoft logout also marks the page as leaving', async () => {
    await start('operator');
    expect(TestBed.inject(Auth).leavingApp()).toBe(false);
    void TestBed.inject(Auth).signOut();
    expect(TestBed.inject(Auth).leavingApp()).toBe(true);
    expect(gateway.signOut).toHaveBeenCalled();
  });

  it('came back from login without a session right after trying: shows the error instead of looping', async () => {
    sessionStorage.setItem(ATTEMPT_KEY, String(Date.now()));
    const harness = await start(null);
    await harness.navigateByUrl('/produtos');
    expect(url()).toBe('/erro-login?voltarPara=%2Fprodutos');
    expect(gateway.signIn).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(gateway.signIn).toHaveBeenCalledWith('/produtos');
  });

  it('the last attempt was long ago: tries the login again normally', async () => {
    sessionStorage.setItem(ATTEMPT_KEY, String(Date.now() - 60_000));
    const harness = await start(null);
    void harness.navigateByUrl('/produtos');
    await vi.waitFor(() => expect(gateway.signIn).toHaveBeenCalledWith('/produtos'));
  });

  it('/saiu (logout destination) is public and does not sign in again by itself', async () => {
    const harness = await start(null);
    await harness.navigateByUrl('/saiu');
    expect(screen.getByRole('heading', { name: 'Você saiu' })).toBeInTheDocument();
    expect(gateway.signIn).not.toHaveBeenCalled();
  });

  it('/login does not exist: a signed-in user goes to the home page', async () => {
    const harness = await start('operator');
    await harness.navigateByUrl('/login');
    expect(url()).toBe('/inicio');
  });

  it('signed in, the session pages send back to the home page', async () => {
    const harness = await start('operator');
    await harness.navigateByUrl('/saiu');
    expect(url()).toBe('/inicio');
  });

  it('expired session (401) goes straight to the backend login', async () => {
    const harness = await start('operator');
    await harness.navigateByUrl('/produtos');
    TestBed.inject(Auth).sessionExpired();
    expect(gateway.signIn).toHaveBeenCalledWith('/produtos');
  });
});
