import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiAlertImports } from '@supermercado/ui/alert';
import { UiButton } from '@supermercado/ui/button';
import { type UiColumn, UiDataTableImports } from '@supermercado/ui/data-table';
import { UiEmptyImports } from '@supermercado/ui/empty';
import { UiIcon } from '@supermercado/ui/icon';
import { UiInputGroupImports } from '@supermercado/ui/input';
import { UiLabel } from '@supermercado/ui/label';
import { UiSelect } from '@supermercado/ui/select';
import { UiSkeleton } from '@supermercado/ui/skeleton';
import { UiSpinner } from '@supermercado/ui/spinner';
import { injectProductFilters } from '../../data-access/inject-product-filters';
import { injectProductPrefetch, injectProducts } from '../../data-access/products.queries';
import { ALL_STATUSES, PRODUCT_STATUSES } from '../../models/product.enums';
import { type Product } from '../../models/product.types';
import { STATUS_LABEL } from '../../models/product.constants';
import { toStatusFilter } from '../../models/product.utils';
import { ProductStatusBadge } from '../../ui/product-status-badge';
import { PRODUCT_COLUMN, TERM_FIELD } from './product-list-page.constants';

@Component({
  selector: 'app-product-list-page',
  imports: [
    RouterLink,
    CurrencyPipe,
    UiAlertImports,
    UiButton,
    UiDataTableImports,
    UiEmptyImports,
    UiIcon,
    UiInputGroupImports,
    UiLabel,
    UiSelect,
    UiSkeleton,
    UiSpinner,
    ProductStatusBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list-page.html',
  styleUrl: './product-list-page.scss',
})
export default class ProductListPage {
  // The "hooks" — each one wraps a reusable piece of logic.
  protected readonly filters = injectProductFilters();
  protected readonly products = injectProducts(this.filters.filters);
  protected readonly prefetch = injectProductPrefetch();

  protected readonly statusOptions = PRODUCT_STATUSES;
  protected readonly statusLabel = STATUS_LABEL;
  protected readonly allStatuses = ALL_STATUSES;
  protected readonly termField = TERM_FIELD;
  protected readonly column = PRODUCT_COLUMN;
  protected readonly loadingRows = [1, 2, 3, 4, 5];

  /** Table columns. Code, price and status get their own cell in the HTML (uiCell). */
  protected readonly columns: UiColumn<Product>[] = [
    { key: PRODUCT_COLUMN.code, title: 'Código' },
    { key: 'name', title: 'Nome' },
    { key: 'category', title: 'Categoria' },
    // The API sends "yyyy-mm-dd"; it becomes "dd/mm/yyyy" without going through a time zone.
    { key: 'expiresAt', title: 'Validade', format: (v) => v.split('-').reverse().join('/') },
    { key: PRODUCT_COLUMN.price, title: 'Preço', align: 'end' },
    { key: PRODUCT_COLUMN.status, title: 'Status' },
  ];

  /** What the user typed only becomes a filter when clicking "Pesquisar" (or Enter). */
  protected onSearch(event: SubmitEvent) {
    event.preventDefault();
    const term = new FormData(event.target as HTMLFormElement).get(TERM_FIELD);
    this.filters.search(typeof term === 'string' ? term : '');
  }

  protected onStatusChange(event: Event) {
    this.filters.filterByStatus(toStatusFilter((event.target as HTMLSelectElement).value));
  }
}
