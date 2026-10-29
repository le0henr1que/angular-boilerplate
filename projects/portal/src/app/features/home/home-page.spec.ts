import { provideRouter } from '@angular/router';
import { EMPTY_FILTERS, ProductsApi } from '@features/products';
import { TEST_PRODUCTS } from '@testing/products.fixture';
import { provideTestAppConfig } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { render, screen, within } from '@testing-library/angular';
import HomePage from './home-page';

describe('HomePage', () => {
  const api = { list: vi.fn(), get: vi.fn() };

  async function renderPage() {
    return render(HomePage, {
      providers: [
        provideTestAppConfig({ appName: 'Portal Teste' }),
        provideTestQueryClient(),
        provideRouter([]),
        { provide: ProductsApi, useValue: api },
      ],
    });
  }

  /** Reads the number shown on the card with the given label. */
  const cardTotal = (label: string) =>
    within(screen.getByText(label).closest('article')!).getByText(/^\d+$/).textContent;

  beforeEach(() => api.list.mockReset().mockResolvedValue(TEST_PRODUCTS));

  it('welcomes with the app name', async () => {
    await renderPage();
    expect(screen.getByRole('heading', { name: 'Bem-vindo ao Portal Teste' })).toBeInTheDocument();
  });

  it('fetches the list WITHOUT filters (same cache key as the products screen)', async () => {
    await renderPage();
    expect(api.list).toHaveBeenCalledWith(EMPTY_FILTERS);
  });

  it('summarizes the stock by status', async () => {
    await renderPage();
    await vi.waitFor(() => expect(cardTotal('Total')).toBe('3'));
    expect(cardTotal('Disponível')).toBe('1');
    expect(cardTotal('Estoque baixo')).toBe('1');
    expect(cardTotal('Esgotado')).toBe('1');
  });

  it('has a shortcut to the product list', async () => {
    await renderPage();
    expect(screen.getByRole('link', { name: /Ver todos os produtos/ })).toHaveAttribute(
      'href',
      '/produtos',
    );
  });
});
