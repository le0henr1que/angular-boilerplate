import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type ListTableColumn, ListTableImports, provideListTable } from '@shared/list-table';
import { UiBadge } from '@supermercado/ui/badge';
import { UiDataTableImports } from '@supermercado/ui/data-table';
import { injectCatalogSource } from '../../data-access/catalog.queries';
import { CATALOG_CATEGORIES } from '../../models/catalog.enums';
import { CATALOG_FILTERS } from '../../models/catalog.filters';
import { CATALOG_LIST_TABLE_PARAMS, PAGE_SIZE_OPTIONS } from '../../models/catalog.constants';
import { type CatalogItem } from '../../models/catalog.types';
import { isLowStock } from '../../models/catalog.utils';
import { CATALOG_COLUMN } from './catalog-page.constants';

/**
 * The screen only says WHAT to list: the source, the columns and its specific filters (category
 * and low stock). Search, sorting, pagination, states and cache come from app-list-table.
 */
@Component({
  selector: 'app-catalog-page',
  imports: [CurrencyPipe, ListTableImports, UiBadge, UiDataTableImports],
  // The screen URL uses the same parameter names as the API (?pagina=&porPagina=&ordenarPor=...).
  providers: [provideListTable({ params: CATALOG_LIST_TABLE_PARAMS })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export default class CatalogPage {
  protected readonly source = injectCatalogSource();
  protected readonly filters = CATALOG_FILTERS;
  protected readonly categories = CATALOG_CATEGORIES;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly column = CATALOG_COLUMN;
  protected readonly isLowStock = isLowStock;

  /** Each column reads a path of the API object, nested ones included ("supplier.name"). */
  protected readonly columns: ListTableColumn<CatalogItem>[] = [
    { key: 'id', title: '#', width: '4rem' },
    { key: 'name', title: 'Produto', sortable: true },
    { key: 'category.name', title: 'Categoria', sortable: true },
    {
      key: 'supplier.name',
      title: 'Fornecedor',
      format: (name, item) => `${name} (${item.supplier.city})`,
    },
    { key: CATALOG_COLUMN.price, title: 'Preço', align: 'end', sortable: true },
    { key: CATALOG_COLUMN.stock, title: 'Estoque', align: 'end', sortable: true },
  ];
}
