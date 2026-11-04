import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Logger } from '@core/logging/logger';
import { type ListTableColumn, ListTableImports, provideListTable } from '@shared/list-table';
import { UiButton } from '@supermercado/ui/button';
import { UiDataTableImports } from '@supermercado/ui/data-table';
import { UiIcon } from '@supermercado/ui/icon';
import { injectSupplierSource } from '../../data-access/registration.queries';
import {
  DEFAULT_SORT,
  PAGE_SIZE_OPTIONS,
  REGISTRATION_LIST_TABLE_PARAMS,
  REGISTRATION_STATUS_FILTER_LABEL,
} from '../../models/registration.constants';
import {
  ALL_REGISTRATION_STATUSES,
  REGISTRATION_STATUSES,
  type RegistrationStatusFilter,
} from '../../models/registration.enums';
import { REGISTRATION_FILTERS } from '../../models/registration.filters';
import { type Supplier } from '../../models/registration.types';
import { RegistrationStatusBadge } from '../../ui/registration-status-badge';
import { SUPPLIER_COLUMN } from './supplier-list-page.constants';

/**
 * "Fornecedores" tab: the list-table in its card variant (heading and search in the card
 * header, compact footer) plus an actions column that receives the whole row.
 */
@Component({
  selector: 'app-supplier-list-page',
  imports: [
    DatePipe,
    ListTableImports,
    RegistrationStatusBadge,
    UiButton,
    UiDataTableImports,
    UiIcon,
  ],
  // The screen URL uses the same parameter names as the API (?situacao=&pagina=...).
  providers: [provideListTable({ params: REGISTRATION_LIST_TABLE_PARAMS })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-list-page.html',
  styleUrl: './supplier-list-page.scss',
})
export default class SupplierListPage {
  readonly #log = inject(Logger).withContext('suppliers');

  protected readonly source = injectSupplierSource();
  protected readonly filters = REGISTRATION_FILTERS;
  protected readonly statuses = REGISTRATION_STATUSES;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly defaultSort = DEFAULT_SORT;
  protected readonly column = SUPPLIER_COLUMN;
  protected readonly allStatusesLabel = REGISTRATION_STATUS_FILTER_LABEL[ALL_REGISTRATION_STATUSES];
  protected readonly statusLabel = (status: RegistrationStatusFilter) =>
    REGISTRATION_STATUS_FILTER_LABEL[status];

  protected readonly columns: ListTableColumn<Supplier>[] = [
    { key: SUPPLIER_COLUMN.name, title: 'Fornecedor', sortable: true },
    { key: 'category.name', title: 'Categoria', sortable: true },
    {
      key: 'location.city',
      title: 'Cidade',
      sortable: true,
      format: (city, supplier) => `${city}/${supplier.location.state}`,
    },
    { key: SUPPLIER_COLUMN.status, title: 'Situação', sortable: true },
    { key: SUPPLIER_COLUMN.updatedAt, title: 'Atualizado em', sortable: true },
    { key: 'updatedBy', title: 'Atualizado por', sortable: true },
    // Not read from the object: its cell is the uiCell template (gets the whole row).
    { id: SUPPLIER_COLUMN.actions, title: 'Ações', align: 'end', width: '4rem' },
  ];

  /** Row action. Swap the log for the real action (open the detail, edit…). */
  protected view(supplier: Supplier) {
    this.#log.info('view supplier', { id: supplier.id });
  }
}
