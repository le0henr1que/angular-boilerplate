import { type ListTableParams } from '@shared/list-table';

/** Resource path, relative to the API base URL (see core/http/api-url.interceptor.ts). */
export const CATALOG_ENDPOINT = 'catalogo';

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

/**
 * Name of each query string parameter, both in the screen URL and in the API call
 * (the values are the URL's, kept as they are):
 *   ?q=cafe&categoria=Bebidas&estoqueBaixo=true&pagina=2&porPagina=20&ordenarPor=price&direcao=desc
 */
export const CATALOG_PARAMS = {
  term: 'q',
  category: 'categoria',
  lowStock: 'estoqueBaixo',
  page: 'pagina',
  pageSize: 'porPagina',
  sortBy: 'ordenarPor',
  sortDirection: 'direcao',
} as const;

/** The screen's list-table uses the same names as the API (see provideListTable in catalog-page.ts). */
export const CATALOG_LIST_TABLE_PARAMS: ListTableParams = {
  search: CATALOG_PARAMS.term,
  page: CATALOG_PARAMS.page,
  pageSize: CATALOG_PARAMS.pageSize,
  sortBy: CATALOG_PARAMS.sortBy,
  sortDirection: CATALOG_PARAMS.sortDirection,
};
