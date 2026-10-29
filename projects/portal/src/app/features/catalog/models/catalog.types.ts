import { type FieldValues, type ListTableRequest, type ListTableResult } from '@shared/list-table';
import { type CATALOG_FILTERS } from './catalog.filters';

/** Shape of each item the API returns. Nested objects, as in a real API. */
export interface CatalogItem {
  id: number;
  name: string;
  price: number;
  category: { id: number; name: string };
  supplier: { name: string; city: string };
  stock: { quantity: number; minimum: number };
}

/** Paginated response of GET {apiUrl}/catalogo: only the requested page, plus the totals. */
export interface CatalogResponse extends ListTableResult<CatalogItem> {
  items: CatalogItem[];
  page: number;
  pageSize: number;
}

export type CatalogFilters = FieldValues<typeof CATALOG_FILTERS>;

/** What the screen asks the API for. Also the cache key (see catalog.queries.ts). */
export type CatalogRequest = ListTableRequest<CatalogFilters>;
