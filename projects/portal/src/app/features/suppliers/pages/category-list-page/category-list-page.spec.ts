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
import { type Category, type CategoryResponse } from '../../models/registration.types';
import CategoryListPage from './category-list-page';

const CATEGORIES: Category[] = [
  {
    id: 3,
    name: 'Bebidas',
    productCount: 42,
    supplierCount: 5,
    status: 'inactive',
    updatedAt: '2026-10-01T09:00:00Z',
    updatedBy: 'Ana Lima',
  },
];

describe('CategoryListPage', () => {
  const service = {
    listCategories: vi.fn(() =>
      of<CategoryResponse>({ items: CATEGORIES, total: 1, page: 1, pageSize: 10, totalPages: 1 }),
    ),
  };
  const log = { info: vi.fn() };
  const user = userEvent.setup();

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideLocalePtBr(),
        provideTestQueryClient(),
        { provide: RegistrationService, useValue: service },
        { provide: Logger, useValue: { withContext: () => log } },
        provideRouter([{ path: 'categorias', component: CategoryListPage }]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/categorias');
    await screen.findByText('Bebidas');
  });

  it('lists the categories with counts, status and last change', () => {
    expect(screen.getByRole('heading', { name: 'Categorias' })).toBeInTheDocument();
    const [, first] = screen.getAllByRole('row');
    const row = within(first);
    expect(row.getByText('42')).toBeInTheDocument();
    expect(row.getByText('5')).toBeInTheDocument();
    expect(row.getByText('Inativo')).toBeInTheDocument();
    expect(row.getByText('01/10/2026 09:00')).toBeInTheDocument();
  });

  it('sorts by product count and logs the clicked row', async () => {
    await user.click(screen.getByRole('button', { name: 'Ordenar por Produtos' }));
    await vi.waitFor(() =>
      expect(TestBed.inject(Router).url).toBe('/categorias?ordenarPor=productCount&direcao=asc'),
    );
    await user.click(screen.getByRole('button', { name: 'Ver Bebidas' }));
    expect(log.info).toHaveBeenCalledWith('view category', { id: 3 });
  });
});
