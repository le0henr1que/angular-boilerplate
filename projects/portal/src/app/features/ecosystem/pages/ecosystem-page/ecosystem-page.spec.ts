import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideLocalePtBr } from '@testing/locale';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { EcosystemService } from '../../data-access/ecosystem.service';
import {
  type EcosystemPartner,
  type EcosystemRequest,
  type EcosystemResponse,
} from '../../models/ecosystem.types';
import EcosystemPage from './ecosystem-page';

const PARTNERS: EcosystemPartner[] = [
  {
    id: 1,
    name: 'Rota Fria Logística',
    type: 'logistics',
    contact: { name: 'Ana', email: 'ana@rotafria.com.br' },
    location: { city: 'Recife', state: 'PE' },
    partnerSince: '2019-03-15',
    active: true,
  },
  {
    id: 2,
    name: 'PagFácil',
    type: 'payment',
    contact: { name: 'Bruno', email: 'bruno@pagfacil.com.br' },
    location: { city: 'São Paulo', state: 'SP' },
    partnerSince: '2022-11-02',
    active: false,
  },
];

/** API response: the requested page with the PARTNERS, out of 2 pages in total. */
const respond = ({ pagination }: EcosystemRequest) =>
  of<EcosystemResponse>({
    items: PARTNERS,
    total: 12,
    page: pagination?.page ?? 1,
    pageSize: pagination?.pageSize ?? 10,
    totalPages: 2,
  });

describe('EcosystemPage', () => {
  const service = { list: vi.fn() };
  const user = userEvent.setup();

  async function open(url = '/ecossistema') {
    TestBed.configureTestingModule({
      providers: [
        provideLocalePtBr(),
        provideTestQueryClient(),
        { provide: EcosystemService, useValue: service },
        provideRouter([{ path: 'ecossistema', component: EcosystemPage }]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    await screen.findByText('Rota Fria Logística');
  }

  const url = () => TestBed.inject(Router).url;
  const calls = (): EcosystemRequest[] => service.list.mock.calls.map(([r]) => r);

  beforeEach(() => {
    service.list.mockReset().mockImplementation(respond);
  });

  it('lists the partners with type, city, contact, date and status', async () => {
    await open();
    const [, first, second] = screen.getAllByRole('row');
    const row = within(first);
    expect(row.getByText('Logística')).toBeInTheDocument();
    expect(row.getByText('Recife/PE')).toBeInTheDocument();
    expect(row.getByRole('link', { name: 'ana@rotafria.com.br' })).toHaveAttribute(
      'href',
      'mailto:ana@rotafria.com.br',
    );
    expect(row.getByText('15/03/2019')).toBeInTheDocument();
    expect(row.getByText('Ativo')).toBeInTheDocument();
    expect(within(second).getByText('Inativo')).toBeInTheDocument();
    expect(screen.getByText('12 item(ns)')).toBeInTheDocument();
  });

  it('starts sorted by name when the URL has no sort', async () => {
    await open();
    expect(calls()[0]).toEqual({
      filters: { type: '', activeOnly: false },
      search: '',
      pagination: { page: 1, pageSize: 10 },
      sort: { field: 'name', direction: 'asc' },
    });
  });

  it('reads type, active only, search and sort from the URL', async () => {
    await open(
      '/ecossistema?q=rota&tipo=logistics&ativos=true&ordenarPor=partnerSince&direcao=desc',
    );
    expect(calls()[0]).toMatchObject({
      filters: { type: 'logistics', activeOnly: true },
      search: 'rota',
      sort: { field: 'partnerSince', direction: 'desc' },
    });
    expect(screen.getByLabelText('Tipo')).toHaveValue('logistics');
    expect(screen.getByLabelText('Só parceiros ativos')).toBeChecked();
  });

  it('shows the type options with readable labels and filters by type', async () => {
    await open('/ecossistema?pagina=2');
    const select = screen.getByLabelText('Tipo');
    expect(
      within(select)
        .getAllByRole('option')
        .map((o) => o.textContent?.trim()),
    ).toEqual(['Todos', 'Fornecedor', 'Logística', 'Pagamentos', 'Marketing']);

    await user.selectOptions(select, 'payment');
    await vi.waitFor(() => expect(url()).toBe('/ecossistema?tipo=payment'));
    await vi.waitFor(() => expect(calls().some((r) => r.filters.type === 'payment')).toBe(true));
  });

  it('sorts by the clicked column', async () => {
    await open();
    await user.click(screen.getByRole('button', { name: 'Ordenar por Cidade' }));
    await vi.waitFor(() => expect(url()).toBe('/ecossistema?ordenarPor=location.city&direcao=asc'));
  });
});
