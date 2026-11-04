import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Logger } from '@core/logging/logger';
import { provideLocalePtBr } from '@testing/locale';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { RegistrationService } from '../../data-access/registration.service';
import {
  type RegistrationRequest,
  type Supplier,
  type SupplierResponse,
} from '../../models/registration.types';
import SupplierListPage from './supplier-list-page';

const SUPPLIERS: Supplier[] = [
  {
    id: 7,
    name: 'Hortifruti Vale Verde',
    document: '12.345.678/0001-90',
    category: { id: 1, name: 'Hortifruti' },
    location: { city: 'Recife', state: 'PE' },
    status: 'active',
    updatedAt: '2026-10-28T14:05:00Z',
    updatedBy: 'João Silva',
  },
  {
    id: 8,
    name: 'Química Brilho',
    document: '98.765.432/0001-10',
    category: { id: 4, name: 'Limpeza' },
    location: { city: 'Natal', state: 'RN' },
    status: 'pending',
    updatedAt: '2026-09-02T08:30:00Z',
    updatedBy: 'Maria Santos',
  },
];

/** API response: the requested page with the SUPPLIERS, out of 3 pages in total. */
const respond = ({ pagination }: RegistrationRequest) =>
  of<SupplierResponse>({
    items: SUPPLIERS,
    total: 24,
    page: pagination?.page ?? 1,
    pageSize: pagination?.pageSize ?? 10,
    totalPages: 3,
  });

describe('SupplierListPage', () => {
  const service = { listSuppliers: vi.fn() };
  const log = { info: vi.fn() };
  const user = userEvent.setup();

  async function open(url = '/fornecedores') {
    TestBed.configureTestingModule({
      providers: [
        provideLocalePtBr(),
        provideTestQueryClient(),
        { provide: RegistrationService, useValue: service },
        { provide: Logger, useValue: { withContext: () => log } },
        provideRouter([{ path: 'fornecedores', component: SupplierListPage }]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    await screen.findByText('Hortifruti Vale Verde');
  }

  const url = () => TestBed.inject(Router).url;
  const calls = (): RegistrationRequest[] => service.listSuppliers.mock.calls.map(([r]) => r);

  beforeEach(() => {
    service.listSuppliers.mockReset().mockImplementation(respond);
    log.info.mockReset();
  });

  it('lists the suppliers in a card, with CNPJ, city, status and last change', async () => {
    await open();
    expect(screen.getByRole('heading', { name: 'Fornecedores' })).toBeInTheDocument();
    const [, first, second] = screen.getAllByRole('row');
    const row = within(first);
    expect(row.getByText('12.345.678/0001-90')).toBeInTheDocument();
    expect(row.getByText('Recife/PE')).toBeInTheDocument();
    expect(row.getByText('Ativo')).toBeInTheDocument();
    expect(row.getByText('28/10/2026 14:05')).toBeInTheDocument();
    expect(row.getByText('João Silva')).toBeInTheDocument();
    expect(within(second).getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toHaveTextContent(
      'Página 1 de 3',
    );
  });

  it('starts sorted by name and reads status and search from the URL', async () => {
    await open('/fornecedores?q=vale&situacao=pending');
    expect(calls()[0]).toEqual({
      filters: { status: 'pending' },
      search: 'vale',
      pagination: { page: 1, pageSize: 10 },
      sort: { field: 'name', direction: 'asc' },
    });
  });

  it('filters by status from the filters panel', async () => {
    await open('/fornecedores?pagina=2');
    await user.click(screen.getByRole('button', { name: /Filtros/ }));
    await user.selectOptions(screen.getByLabelText('Situação'), 'inactive');
    await vi.waitFor(() => expect(url()).toBe('/fornecedores?situacao=inactive'));
  });

  it('the row action receives the whole row (logs its id)', async () => {
    await open();
    await user.click(screen.getByRole('button', { name: 'Ver Química Brilho' }));
    expect(log.info).toHaveBeenCalledWith('view supplier', { id: 8 });
  });
});
