import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Logger } from '@core/logging/logger';
import { type ListTableColumn, ListTableImports, provideListTable } from '@shared/list-table';
import { UiButton } from '@supermercado/ui/button';
import { UiDataTableImports } from '@supermercado/ui/data-table';
import { UiIcon } from '@supermercado/ui/icon';
import { injectCategorySource } from '../../data-access/registration.queries';
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
import { type Category } from '../../models/registration.types';
import { RegistrationStatusBadge } from '../../ui/registration-status-badge';
import { CATEGORY_COLUMN } from './category-list-page.constants';

/** "Categorias" tab: same card list-table as the suppliers tab, over the categories. */
@Component({
  selector: 'app-category-list-page',
  imports: [
    DatePipe,
    ListTableImports,
    RegistrationStatusBadge,
    UiButton,
    UiDataTableImports,
    UiIcon,
  ],
  providers: [provideListTable({ params: REGISTRATION_LIST_TABLE_PARAMS })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-list-page.html',
  styleUrl: './category-list-page.scss',
})
export default class CategoryListPage {
  readonly #log = inject(Logger).withContext('categories');

  protected readonly source = injectCategorySource();
  protected readonly filters = REGISTRATION_FILTERS;
  protected readonly statuses = REGISTRATION_STATUSES;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly defaultSort = DEFAULT_SORT;
  protected readonly column = CATEGORY_COLUMN;
  protected readonly allStatusesLabel = REGISTRATION_STATUS_FILTER_LABEL[ALL_REGISTRATION_STATUSES];
  protected readonly statusLabel = (status: RegistrationStatusFilter) =>
    REGISTRATION_STATUS_FILTER_LABEL[status];

  protected readonly columns: ListTableColumn<Category>[] = [
    { key: CATEGORY_COLUMN.name, title: 'Categoria', sortable: true },
    { key: CATEGORY_COLUMN.productCount, title: 'Produtos', align: 'end', sortable: true },
    { key: CATEGORY_COLUMN.supplierCount, title: 'Fornecedores', align: 'end', sortable: true },
    { key: CATEGORY_COLUMN.status, title: 'Situação', sortable: true },
    { key: CATEGORY_COLUMN.updatedAt, title: 'Atualizado em', sortable: true },
    { key: 'updatedBy', title: 'Atualizado por', sortable: true },
    { id: CATEGORY_COLUMN.actions, title: 'Ações', align: 'end', width: '4rem' },
  ];

  /** Row action. Swap the log for the real action (open the detail, edit…). */
  protected view(category: Category) {
    this.#log.info('view category', { id: category.id });
  }
}
