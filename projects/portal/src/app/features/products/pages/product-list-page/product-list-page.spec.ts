import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideLocalePtBr } from '@testing/locale';
import { TEST_PRODUCTS } from '@testing/products.fixture';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ProductsApi } from '../../data-access/products.api';
import { type Product, type ProductFilters } from '../../models/product.types';
import ProductListPage from './product-list-page';

@Component({ template: 'detail' })
class FakeDetail {}

describe('ProductListPage', () => {
  const api = {
    list: vi.fn<(f: ProductFilters) => Promise<Product[]>>(),
    get: vi.fn<(code: string) => Promise<Product>>(),
  };
  let harness: RouterTestingHarness;

  async function open(url = '/produtos') {
    TestBed.configureTestingModule({
      providers: [
        provideTestQueryClient(),
        provideLocalePtBr(),
        { provide: ProductsApi, useValue: api },
        provideRouter([
          { path: 'produtos', component: ProductListPage },
          { path: 'produtos/:code', component: FakeDetail },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
  }

  const url = () => TestBed.inject(Router).url;
  const user = userEvent.setup();

  beforeEach(() => {
    api.list.mockReset().mockResolvedValue(TEST_PRODUCTS);
    api.get.mockReset().mockResolvedValue(TEST_PRODUCTS[0]);
  });

  it('shows the loading skeleton on the first fetch', async () => {
    api.list.mockReturnValue(new Promise(() => undefined)); // never answers
    await open();
    expect(screen.getByLabelText('Carregando produtos')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the table with the data formatted in pt-BR', async () => {
    await open();
    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(1 + TEST_PRODUCTS.length); // header + data

    const first = within(rows[1]);
    expect(first.getByRole('link', { name: 'HO-1' })).toHaveAttribute('href', '/produtos/HO-1');
    expect(first.getByText('Banana prata (kg)')).toBeInTheDocument();
    expect(first.getByText(/R\$\s7,99/)).toBeInTheDocument();
    expect(first.getByText(/08\/01\/2026/)).toBeInTheDocument();
    expect(first.getByText('Disponível')).toBeInTheDocument();
    expect(screen.getByText(/3 produto\(s\)/)).toBeInTheDocument();
  });

  it('searches when clicking "Pesquisar": writes to the URL and calls the API with the term', async () => {
    await open();
    await screen.findByRole('table');

    await user.type(screen.getByLabelText('Pesquisar'), 'banana');
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));

    await vi.waitFor(() => expect(url()).toBe('/produtos?q=banana'));
    await vi.waitFor(() =>
      expect(api.list).toHaveBeenLastCalledWith({ term: 'banana', status: 'all' }),
    );
  });

  it('searches on Enter without reloading the page', async () => {
    await open();
    await user.type(screen.getByLabelText('Pesquisar'), 'suco{Enter}');
    await vi.waitFor(() => expect(url()).toBe('/produtos?q=suco'));
  });

  it('does not search while the user is only typing', async () => {
    await open();
    await screen.findByRole('table');
    await user.type(screen.getByLabelText('Pesquisar'), 'banana');
    expect(url()).toBe('/produtos');
    expect(api.list).toHaveBeenCalledTimes(1);
  });

  it('filters by status when the select changes', async () => {
    await open();
    await user.selectOptions(screen.getByLabelText('Status'), 'low');
    await vi.waitFor(() => expect(url()).toBe('/produtos?status=low'));
    await vi.waitFor(() => expect(api.list).toHaveBeenLastCalledWith({ term: '', status: 'low' }));
  });

  it('opens with the URL filters already applied to the form', async () => {
    await open('/produtos?q=pao&status=out-of-stock');
    expect(screen.getByLabelText('Pesquisar')).toHaveValue('pao');
    expect(screen.getByLabelText('Status')).toHaveValue('out-of-stock');
    expect(api.list).toHaveBeenCalledWith({ term: 'pao', status: 'out-of-stock' });
  });

  it('"Limpar" only shows with a filter and removes the filters', async () => {
    await open();
    expect(screen.queryByRole('button', { name: 'Limpar' })).not.toBeInTheDocument();

    await harness.navigateByUrl('/produtos?q=banana');
    await user.click(await screen.findByRole('button', { name: 'Limpar' }));

    await vi.waitFor(() => expect(url()).toBe('/produtos'));
    await vi.waitFor(() => expect(screen.getByLabelText('Pesquisar')).toHaveValue(''));
  });

  it('shows the empty state when nothing is found', async () => {
    api.list.mockResolvedValue([]);
    await open('/produtos?q=zzz');
    expect(await screen.findByText('Nenhum produto encontrado')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    await vi.waitFor(() => expect(url()).toBe('/produtos'));
  });

  it('shows the error and allows retrying', async () => {
    api.list.mockRejectedValueOnce(new Error('down'));
    await open();
    expect(await screen.findByText('Não foi possível carregar os produtos')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(api.list).toHaveBeenCalledTimes(2);
  });

  it('preloads the detail when hovering the code', async () => {
    await open();
    await user.hover(await screen.findByRole('link', { name: 'BE-2' }));
    await vi.waitFor(() => expect(api.get).toHaveBeenCalledWith('BE-2'));
  });

  it('navigates to the detail when clicking the code', async () => {
    await open();
    await user.click(await screen.findByRole('link', { name: 'PA-3' }));
    await vi.waitFor(() => expect(url()).toBe('/produtos/PA-3'));
  });
});
