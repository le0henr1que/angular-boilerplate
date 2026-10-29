import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ProductsApi } from '@features/products';
import { provideLocalePtBr } from '@testing/locale';
import { TEST_PRODUCTS } from '@testing/products.fixture';
import { provideTestAppConfig } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen } from '@testing-library/angular';
import { routes } from './app.routes';

/** Tests the real navigation: real routes, real screens, only the API is fake. */
describe('App routes', () => {
  let harness: RouterTestingHarness;
  const api = {
    list: vi.fn().mockResolvedValue(TEST_PRODUCTS),
    get: vi.fn().mockResolvedValue(TEST_PRODUCTS[0]),
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig(),
        provideTestQueryClient(),
        provideLocalePtBr(),
        { provide: ProductsApi, useValue: api },
        provideRouter(routes, withComponentInputBinding()),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  const url = () => TestBed.inject(Router).url;

  it('the root redirects to /inicio', async () => {
    await harness.navigateByUrl('/');
    expect(url()).toBe('/inicio');
    expect(await screen.findByRole('heading', { name: /Bem-vindo/ })).toBeInTheDocument();
  });

  it('/produtos opens the list (lazy loaded)', async () => {
    await harness.navigateByUrl('/produtos');
    expect(screen.getByRole('heading', { name: 'Produtos' })).toBeInTheDocument();
  });

  it('/produtos/:code opens that product detail', async () => {
    await harness.navigateByUrl('/produtos/HO-1');
    expect(await screen.findByRole('heading', { name: 'HO-1' })).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('HO-1');
  });

  it('an unknown address shows the 404 page with a link to the home page', async () => {
    await harness.navigateByUrl('/nao-existe');
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute('href', '/');
  });

  it('sets the tab title for each page', async () => {
    await harness.navigateByUrl('/produtos');
    await vi.waitFor(() => expect(document.title).toBe('Produtos'));
    await harness.navigateByUrl('/nao-existe');
    await vi.waitFor(() => expect(document.title).toBe('Página não encontrada'));
  });
});
