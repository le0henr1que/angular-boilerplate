import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Auth } from '@core/auth/auth';
import { AuthGateway } from '@core/auth/gateways/auth-gateway';
import { type Role } from '@core/auth/auth.enums';
import { type FeatureFlags } from '@core/config/feature-flags.types';
import { ProductsApi } from '@features/products';
import { provideLocalePtBr } from '@testing/locale';
import { TEST_PRODUCTS } from '@testing/products.fixture';
import { provideTestAppConfig } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen } from '@testing-library/angular';
import { routes } from './app.routes';

/** Real gates: real routes + real Auth. Only whoever answers "who is signed in" is fake. */
describe('App routes with authentication', () => {
  const url = () => TestBed.inject(Router).url;

  async function start(role: Role | null, features: Partial<FeatureFlags> = {}) {
    const user = role ? { id: '1', name: 'Teste', email: 't@x', roles: [role] } : null;
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({ features: { authentication: true, ...features } }),
        provideTestQueryClient(),
        provideLocalePtBr(),
        { provide: AuthGateway, useValue: { fetchUser: () => Promise.resolve(user) } },
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

  it('without a session, any screen sends to the login keeping the destination', async () => {
    const harness = await start(null);
    await harness.navigateByUrl('/produtos?q=arroz');
    expect(url()).toBe('/login?voltarPara=%2Fprodutos%3Fq%3Darroz');
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('signed in, the login screen sends back to the home page', async () => {
    const harness = await start('operator');
    await harness.navigateByUrl('/login');
    expect(url()).toBe('/inicio');
  });

  it('without the admin role, /admin goes to /sem-permissao', async () => {
    const harness = await start('customer');
    await harness.navigateByUrl('/admin');
    expect(url()).toBe('/sem-permissao');
  });

  it('an admin gets into /admin', async () => {
    const harness = await start('admin');
    await harness.navigateByUrl('/admin');
    expect(await screen.findByRole('heading', { name: 'Administração' })).toBeInTheDocument();
  });

  it('adminArea flag off: /admin does not exist even for the admin', async () => {
    const harness = await start('admin', { adminArea: false });
    await harness.navigateByUrl('/admin');
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
  });

  it('roleControl flag off: any signed-in user gets into /admin', async () => {
    const harness = await start('customer', { roleControl: false });
    await harness.navigateByUrl('/admin');
    expect(url()).toBe('/admin');
  });

  it('authentication flag off: open app and /login disappears', async () => {
    const harness = await start(null, { authentication: false });
    await harness.navigateByUrl('/produtos');
    expect(url()).toBe('/produtos');
    await harness.navigateByUrl('/login');
    expect(url()).toBe('/inicio');
  });
});
