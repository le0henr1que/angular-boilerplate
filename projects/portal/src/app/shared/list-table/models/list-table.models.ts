import { type UiColuna } from '@supermercado/ui/data-table';
import { type QueryKey } from '@tanstack/angular-query-experimental';
import { type Observable } from 'rxjs';

export const FIRST_PAGE = 1;

export interface Pagination {
  /** Starts at FIRST_PAGE. */
  page: number;
  pageSize: number;
}

export const SORT_DIRECTION = {
  asc: 'asc',
  desc: 'desc',
} as const;
export type SortDirection = (typeof SORT_DIRECTION)[keyof typeof SORT_DIRECTION];

export interface Sort {
  /** Column id (its `id` or, without one, its `chave`). */
  field: string;
  direction: SortDirection;
}

/** A ui-data-table column, plus what only the list-table understands. */
export type ListTableColumn<T> = UiColuna<T> & {
  /** Shows the sort button in the header. */
  sortable?: boolean;
};

/**
 * What the list-table asks the data source for. Each disabled part comes "empty":
 * search = '' (no search), pagination = null, sort = null.
 */
export interface ListTableRequest<F> {
  filters: F;
  search: string;
  pagination: Pagination | null;
  sort: Sort | null;
}

/** What the source returns. */
export interface ListTableResult<T> {
  items: readonly T[];
  /** Total matching the filters (all pages). */
  total: number;
  totalPages: number;
}

/**
 * Where the data comes from. The list-table handles caching (TanStack Query), cancellation and
 * prefetching the next page; the source only translates the request to the API.
 */
export interface ListTableSource<T, F> {
  /** Cache key prefix. The full request is appended to it. */
  key: QueryKey;
  fetch: (
    request: ListTableRequest<F>,
  ) => Observable<ListTableResult<T>> | Promise<ListTableResult<T>>;
}

export function columnId<T>(column: UiColuna<T>): string {
  return column.id ?? (column.chave as string);
}
