import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { createQueryClient } from '@core/query/query-client';
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { provideLocalePtBr } from '@testing/locale';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NEVER, of, throwError } from 'rxjs';
import { CatalogService } from '../../data-access/catalog.service';
import {
  type CatalogItem,
  type CatalogRequest,
  type CatalogResponse,
} from '../../models/catalog.types';
import CatalogPage from './catalog-page';

const ITEMS: CatalogItem[] = [
  {
    id: 1,
    name: 'Banana prata (kg)',
    price: 7.99,
    category: { id: 1, name: 'Hortifruti' },
    supplier: { name: 'Sítio Bom Fruto', city: 'Petrolina' },
    stock: { quantity: 120, minimum: 30 },
  },
  {
    id: 2,
    name: 'Pão de forma integral',
    price: 12.5,
    category: { id: 2, name: 'Padaria' },
    supplier: { name: 'Trigo Fino', city: 'Recife' },
    stock: { quantity: 8, minimum: 15 },
  },
];

@Component({ template: 'other' })
class OtherPage {}

/** API response: the requested page with the ITEMS, out of 3 pages in total. */
const respond = ({ pagination }: CatalogRequest) =>
  of<CatalogResponse>({
    items: ITEMS,
    total: 25,
    page: pagination?.page ?? 1,
    pageSize: pagination?.pageSize ?? 10,
    totalPages: 3,
  });

describe('CatalogPage', () => {
  const service = { list: vi.fn() };
  const user = userEvent.setup();
  let harness: RouterTestingHarness;

  async function open(url = '/catalogo', queryClient = provideTestQueryClient()) {
    TestBed.configureTestingModule({
      providers: [
        provideLocalePtBr(),
        queryClient,
        { provide: CatalogService, useValue: service },
        provideRouter([
          { path: 'catalogo', component: CatalogPage },
          { path: 'outra', component: OtherPage },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
  }

  const url = () => TestBed.inject(Router).url;
  /** Request of each API call, in order. */
  const calls = (): CatalogRequest[] => service.list.mock.calls.map(([r]) => r);

  // Braces: in Vitest, a function returned by beforeEach runs as cleanup at the end of the test.
  beforeEach(() => {
    service.list.mockReset().mockImplementation(respond);
  });

  it('shows the page coming from the API, reading the nested fields', async () => {
    await open();
    await screen.findByText('Banana prata (kg)');
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1 + ITEMS.length);

    const cells = within(rows[1])
      .getAllByRole('cell')
      .map((td) => td.textContent?.trim());
    expect(cells[2]).toBe('Hortifruti');
    expect(cells[3]).toBe('Sítio Bom Fruto (Petrolina)');
    expect(cells[4]).toMatch(/R\$\s7,99/);
    expect(screen.getByText(/25 item\(ns\)/)).toBeInTheDocument();
    expect(calls()[0]).toEqual({
      filters: { category: '', lowStock: false },
      search: '',
      pagination: { page: 1, pageSize: 10 },
      sort: null,
    });
  });

  it('flags stock below the minimum', async () => {
    await open();
    await screen.findByText('Banana prata (kg)');
    const [, banana, bread] = screen.getAllByRole('row');
    expect(within(banana).queryByText('Baixo')).not.toBeInTheDocument();
    expect(within(bread).getByText('Baixo')).toBeInTheDocument();
  });

  it('prefetches the next page as soon as the current one arrives', async () => {
    await open();
    await screen.findByText('Banana prata (kg)');
    await vi.waitFor(() => expect(calls().map((r) => r.pagination?.page)).toEqual([1, 2]));
  });

  it('sends the URL filters to the API', async () => {
    await open('/catalogo?q=cafe&categoria=Bebidas&estoqueBaixo=true&pagina=2');
    await screen.findByText('Banana prata (kg)');
    expect(calls()[0]).toEqual({
      filters: { category: 'Bebidas', lowStock: true },
      search: 'cafe',
      pagination: { page: 2, pageSize: 10 },
      sort: null,
    });
    expect(screen.getByLabelText('Pesquisar')).toHaveValue('cafe');
    expect(screen.getByLabelText('Categoria')).toHaveValue('Bebidas');
    expect(screen.getByLabelText('Só estoque baixo')).toBeChecked();
  });

  it('Enter searches right away, writes to the URL and calls the API with the term', async () => {
    await open();
    await screen.findByText('Banana prata (kg)');
    await user.type(screen.getByLabelText('Pesquisar'), 'cafe{Enter}');
    await vi.waitFor(() => expect(url()).toBe('/catalogo?q=cafe'));
    await vi.waitFor(() => expect(calls().some((r) => r.search === 'cafe')).toBe(true));
  });

  it('category and low stock filter and go back to page 1', async () => {
    await open('/catalogo?pagina=3');
    await screen.findByText('Banana prata (kg)');
    await user.selectOptions(screen.getByLabelText('Categoria'), 'Padaria');
    await vi.waitFor(() => expect(url()).toBe('/catalogo?categoria=Padaria'));
    await user.click(screen.getByLabelText('Só estoque baixo'));
    await vi.waitFor(() => expect(url()).toBe('/catalogo?categoria=Padaria&estoqueBaixo=true'));
  });

  it('sorts by header and sends the sort to the API', async () => {
    await open();
    await screen.findByText('Banana prata (kg)');
    await user.click(screen.getByRole('button', { name: 'Ordenar por Preço' }));
    await vi.waitFor(() => expect(url()).toBe('/catalogo?ordenarPor=price&direcao=asc'));
    await vi.waitFor(() => expect(calls().some((r) => r.sort?.field === 'price')).toBe(true));
  });

  it('pagination changes the page in the URL', async () => {
    await open();
    await screen.findByText('Banana prata (kg)');
    await user.click(screen.getByRole('button', { name: 'Página 3' }));
    await vi.waitFor(() => expect(url()).toBe('/catalogo?pagina=3'));
    await user.click(await screen.findByRole('button', { name: 'Anterior' }));
    await vi.waitFor(() => expect(url()).toBe('/catalogo?pagina=2'));
  });

  it('shows the skeleton while the API does not answer', async () => {
    service.list.mockReturnValue(NEVER);
    await open();
    expect(screen.getAllByRole('rowgroup')[1]).toHaveAttribute('aria-busy', 'true');
  });

  it('shows the error and retries', async () => {
    service.list.mockReturnValueOnce(throwError(() => new Error('failed')));
    await open();
    await user.click(await screen.findByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('Banana prata (kg)')).toBeInTheDocument();
  });

  it('does not call the API again when leaving and coming back (uses the cache)', async () => {
    // The app's QueryClient (with staleTime), not the test one: it is what defines the cache.
    await open('/catalogo', provideTanStackQuery(createQueryClient()));
    await screen.findByText('Banana prata (kg)');
    await vi.waitFor(() => expect(service.list).toHaveBeenCalledTimes(2)); // page 1 + prefetch of 2

    await harness.navigateByUrl('/outra'); // left the screen (the component is destroyed)
    expect(screen.queryByText('Banana prata (kg)')).not.toBeInTheDocument();

    await harness.navigateByUrl('/catalogo'); // came back
    expect(screen.getByText('Banana prata (kg)')).toBeInTheDocument(); // right away, from the cache
    expect(service.list).toHaveBeenCalledTimes(2);
  });
});
