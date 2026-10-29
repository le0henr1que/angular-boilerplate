import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { type Observable, of } from 'rxjs';
import { injectListTableFilter } from './hooks/inject-list-table-filter';
import {
  booleanFilter,
  defineFilter,
  type FieldValues,
  type ListTableColumn,
  ListTableImports,
  type ListTableRequest,
  type ListTableResult,
  type ListTableSource,
  LIST_TABLE_LOGGER,
  optionsFilter,
  provideListTable,
  type UrlField,
} from './index';

interface Order {
  id: number;
  customer: string;
  total: number;
}

const ORDERS: Order[] = [
  { id: 1, customer: 'Ana', total: 10 },
  { id: 2, customer: 'Bruno', total: 20 },
];

const STATUS = ['open', 'paid'] as const;

const FILTERS = {
  status: optionsFilter('status', STATUS),
  urgent: booleanFilter('urgent'),
  store: defineFilter({ param: 'store', defaultValue: 0, parse: (text) => Number(text) || 0 }),
};
type Filters = FieldValues<typeof FILTERS>;
type Result = ListTableResult<Order>;

const COLUMNS: ListTableColumn<Order>[] = [
  { key: 'id', title: '#' },
  { key: 'customer', title: 'Cliente', sortable: true },
  { key: 'total', title: 'Total', sortable: true },
];

/** An "outside" filter, built only with the public hook. */
@Component({
  selector: 'app-store-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button type="button" (click)="store.set(7)">Loja {{ store.value() }}</button>`,
})
class StoreFilter {
  readonly filter = input.required<UrlField<number>>();
  protected readonly store = injectListTableFilter(this.filter);
}

@Component({
  imports: [ListTableImports, StoreFilter],
  template: `
    <app-list-table
      [source]="source"
      [columns]="columns"
      [filters]="filters"
      [pagination]="pagination()"
      [search]="search()"
    >
      <app-list-table-options-filter
        label="Status"
        allLabel="Todos"
        [filter]="filters.status"
        [options]="status"
      />
      <app-list-table-boolean-filter label="Urgente" [filter]="filters.urgent" />
      <app-store-filter [filter]="filters.store" />
    </app-list-table>
  `,
})
class Host {
  readonly fetch = vi.fn<(request: ListTableRequest<Filters>) => Observable<Result>>(() =>
    of({ items: ORDERS, total: 25, totalPages: 3 }),
  );
  readonly source: ListTableSource<Order, Filters> = { key: ['orders'], fetch: this.fetch };
  readonly columns = COLUMNS;
  readonly filters = FILTERS;
  readonly status = STATUS;
  readonly pagination = signal(true);
  readonly search = signal(true);
}

describe('ListTable', () => {
  const user = userEvent.setup();
  let harness: RouterTestingHarness;
  let host: Host;

  async function open(url = '/orders') {
    TestBed.configureTestingModule({
      providers: [provideTestQueryClient(), provideRouter([{ path: 'orders', component: Host }])],
    });
    harness = await RouterTestingHarness.create();
    host = await harness.navigateByUrl(url, Host);
    await screen.findByText('Ana');
  }

  const url = () => TestBed.inject(Router).url;
  const firstRequest = () => host.fetch.mock.calls[0][0];
  const stable = () => harness.fixture.whenStable();

  afterEach(() => vi.useRealTimers());

  it('comes with search, sorting and pagination, and reads everything from the URL', async () => {
    await open(
      '/orders?q=ana&status=paid&urgent=true&store=3&page=2&pageSize=20&sortBy=total&sortDirection=desc',
    );
    expect(firstRequest()).toEqual({
      filters: { status: 'paid', urgent: true, store: 3 },
      search: 'ana',
      pagination: { page: 2, pageSize: 20 },
      sort: { field: 'total', direction: 'desc' },
    });
    expect(screen.getByLabelText('Pesquisar')).toHaveValue('ana');
    expect(screen.getByLabelText('Status')).toHaveValue('paid');
    expect(screen.getByLabelText('Urgente')).toBeChecked();
    expect(screen.getByRole('button', { name: 'Página 3' })).toBeInTheDocument();
  });

  it('replaces invalid URL values with the defaults', async () => {
    await open('/orders?status=xyz&page=-2&pageSize=999&sortBy=id&sortDirection=xyz');
    expect(firstRequest()).toEqual({
      filters: { status: '', urgent: false, store: 0 },
      search: '',
      pagination: { page: 1, pageSize: 10 },
      sort: null, // "id" is not sortable
    });
  });

  it('debounces the search, replacing history', async () => {
    await open();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const field = screen.getByLabelText('Pesquisar');
    await user.type(field, 'bru');
    expect(url()).toBe('/orders'); // not yet
    await vi.advanceTimersByTimeAsync(300);
    vi.useRealTimers();
    await stable();
    expect(url()).toBe('/orders?q=bru');
  });

  it('Enter searches right away and keeps the space the user typed', async () => {
    await open();
    await user.type(screen.getByLabelText('Pesquisar'), 'bruno {Enter}');
    await vi.waitFor(() => expect(url()).toBe('/orders?q=bruno'));
    expect(screen.getByLabelText('Pesquisar')).toHaveValue('bruno ');
  });

  it('changing a filter (built-in or built with the hook) goes back to page 1', async () => {
    await open('/orders?page=3');
    await user.selectOptions(screen.getByLabelText('Status'), 'open');
    await vi.waitFor(() => expect(url()).toBe('/orders?status=open'));

    await user.click(screen.getByRole('button', { name: 'Loja 0' }));
    await vi.waitFor(() => expect(url()).toBe('/orders?status=open&store=7'));
    expect(screen.getByRole('button', { name: 'Loja 7' })).toBeInTheDocument();
  });

  it('sorts by header: ascending → descending → unsorted', async () => {
    await open('/orders?page=2');
    const sortByTotal = () => screen.getByRole('button', { name: 'Ordenar por Total' });

    await user.click(sortByTotal());
    await vi.waitFor(() => expect(url()).toBe('/orders?sortBy=total&sortDirection=asc'));
    expect(sortByTotal()).toHaveAttribute('data-direction', 'asc');

    await user.click(sortByTotal());
    await vi.waitFor(() => expect(url()).toBe('/orders?sortBy=total&sortDirection=desc'));

    await user.click(sortByTotal());
    await vi.waitFor(() => expect(url()).toBe('/orders'));
    expect(sortByTotal()).not.toHaveAttribute('data-direction');
  });

  it('pagination: changes page and page size in the URL', async () => {
    await open();
    await user.click(screen.getByRole('button', { name: 'Página 3' }));
    await vi.waitFor(() => expect(url()).toBe('/orders?page=3'));
    await user.selectOptions(screen.getByLabelText('Itens por página'), '50');
    await vi.waitFor(() => expect(url()).toBe('/orders?pageSize=50'));
  });

  it('prefetches the next page', async () => {
    await open();
    await vi.waitFor(() =>
      expect(host.fetch.mock.calls.map(([request]) => request.pagination?.page)).toEqual([1, 2]),
    );
  });

  it('Clear removes search and filters, but keeps the page size', async () => {
    await open('/orders?q=ana&status=paid&page=2&pageSize=50');
    await user.click(screen.getByRole('button', { name: 'Limpar' }));
    await vi.waitFor(() => expect(url()).toBe('/orders?pageSize=50'));
    expect(screen.getByLabelText('Pesquisar')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Limpar' })).not.toBeInTheDocument();
  });

  it('turns pagination and search off', async () => {
    await open('/orders?page=2&q=ana');
    host.pagination.set(false);
    host.search.set(false);
    await stable();

    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Itens por página')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Pesquisar')).not.toBeInTheDocument();
    await vi.waitFor(() =>
      expect(host.fetch).toHaveBeenLastCalledWith(
        expect.objectContaining({ pagination: null, search: '' }),
      ),
    );
  });

  it('shows the rows and the total', async () => {
    await open();
    const [, first] = screen.getAllByRole('row');
    expect(within(first).getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('25 item(ns)')).toBeInTheDocument();
  });

  it('logs each request through LIST_TABLE_LOGGER', async () => {
    const logger = { debug: vi.fn(), error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: LIST_TABLE_LOGGER, useValue: logger }],
    });
    await open('/orders?status=paid');
    expect(logger.debug).toHaveBeenCalledWith(
      'request',
      expect.objectContaining({ filters: { status: 'paid', urgent: false, store: 0 } }),
    );
  });

  it('provideListTable overrides parameter names and texts', async () => {
    TestBed.configureTestingModule({
      providers: [provideListTable({ params: { search: 'term' }, texts: { search: 'Buscar' } })],
    });
    await open('/orders?term=ana');
    expect(firstRequest().search).toBe('ana');
    expect(screen.getByLabelText('Buscar')).toHaveValue('ana');
  });
});
