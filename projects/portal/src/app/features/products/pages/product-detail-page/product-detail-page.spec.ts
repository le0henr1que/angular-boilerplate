import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideLocalePtBr } from '@testing/locale';
import { TEST_PRODUCTS } from '@testing/products.fixture';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ProductsApi } from '../../data-access/products.api';
import { type Product } from '../../models/product.types';
import ProductDetailPage from './product-detail-page';

@Component({ template: 'list' })
class FakeList {}

describe('ProductDetailPage', () => {
  const api = { list: vi.fn(), get: vi.fn<(code: string) => Promise<Product>>() };

  async function open(code: string) {
    TestBed.configureTestingModule({
      providers: [
        provideTestQueryClient(),
        provideLocalePtBr(),
        { provide: ProductsApi, useValue: api },
        provideRouter(
          [
            { path: 'produtos', component: FakeList },
            { path: 'produtos/:code', component: ProductDetailPage },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/produtos/${code}`);
    return harness;
  }

  beforeEach(() => api.get.mockReset());

  it('shows the skeleton while loading', async () => {
    // Response controlled by the test. A Promise that never resolves would leave a TanStack
    // "pending task" open forever and TestBed could not finish the test.
    let respond!: (p: Product) => void;
    api.get.mockReturnValue(new Promise((resolve) => (respond = resolve)));
    await open('HO-1');

    expect(screen.getByLabelText('Carregando produto')).toHaveAttribute('aria-busy', 'true');

    respond(TEST_PRODUCTS[0]);
    expect(await screen.findByRole('heading', { name: 'HO-1' })).toBeInTheDocument();
  });

  it('fetches by the route code and shows the formatted data', async () => {
    api.get.mockResolvedValue(TEST_PRODUCTS[1]);
    await open('BE-2');

    expect(await screen.findByRole('heading', { name: 'BE-2' })).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('BE-2');
    expect(screen.getByText('Bebidas · Suco de laranja 1 L')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s9,80/)).toBeInTheDocument();
    expect(screen.getByText('10/02/2026')).toBeInTheDocument();
    expect(screen.getByText('09/08/2026')).toBeInTheDocument();
    expect(screen.getByText('Distribuidora Bom Preço')).toBeInTheDocument();
    expect(screen.getByText('Loja Norte')).toBeInTheDocument();
    expect(screen.getByText('Estoque baixo')).toBeInTheDocument();
  });

  it('shows "not found" when the API answers 404', async () => {
    api.get.mockRejectedValueOnce(new HttpErrorResponse({ status: 404 }));
    await open('XX-9');
    expect(await screen.findByText('Produto não encontrado')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/XX-9/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument();
  });

  it('shows an error with "Tentar de novo" for other failures', async () => {
    api.get
      .mockRejectedValueOnce(new HttpErrorResponse({ status: 500 }))
      .mockResolvedValueOnce(TEST_PRODUCTS[0]);
    await open('HO-1');

    await userEvent.click(await screen.findByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('heading', { name: 'HO-1' })).toBeInTheDocument();
  });

  it('the "Voltar" link goes to the list', async () => {
    api.get.mockResolvedValue(TEST_PRODUCTS[0]);
    await open('HO-1');
    await userEvent.click(screen.getByRole('link', { name: /Voltar para produtos/ }));
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/produtos'));
  });
});
