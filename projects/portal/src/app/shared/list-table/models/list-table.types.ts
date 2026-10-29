import { type Signal } from '@angular/core';
import { type UiColumn } from '@supermercado/ui/data-table';
import { type QueryKey } from '@tanstack/angular-query-experimental';
import { type Observable } from 'rxjs';
import { type SortDirection } from './list-table.enums';
import { type UrlField } from './url-field.types';

// ── Request / response ──

export interface Pagination {
  /** Starts at FIRST_PAGE. */
  page: number;
  pageSize: number;
}

export interface Sort {
  /** Column id (its `id` or, without one, its `key`). */
  field: string;
  direction: SortDirection;
}

/** A ui-data-table column, plus what only the list-table understands. */
export type ListTableColumn<T> = UiColumn<T> & {
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

// ── Context offered to the projected filters ──

export interface ApplyOptions {
  /** true: replaces the current history entry instead of adding one (e.g. while typing). */
  replaceHistory?: boolean;
}

/**
 * What the list-table offers to the filters projected into it (its "children").
 * It is an abstraction: filters depend on this contract, not on the component.
 */
export interface ListTableContext {
  /** Current filter value (reads signals: reactive inside computed/template). */
  filterValue<V>(field: UrlField<V>): V;
  /** Writes the filter to the URL and goes back to the first page. */
  applyFilter<V>(field: UrlField<V>, value: V, options?: ApplyOptions): void;
  /** Some filter (or the search) differs from its default. */
  readonly hasFilter: Signal<boolean>;
  clearFilters(): void;
}

// ── Logging contract (the app plugs in its Logger; shared/ can't depend on core/) ──

export interface ListTableLogger {
  debug(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

// ── Configuration ──

/** Query string name of each built-in part of the list-table. */
export interface ListTableParams {
  search: string;
  page: string;
  pageSize: string;
  sortBy: string;
  sortDirection: string;
}

/** Text shown to the user (the app's language, not the code's). */
export interface ListTableTexts {
  search: string;
  searchPlaceholder: string;
  clear: string;
  pageSize: string;
  refreshing: string;
  empty: string;
  errorTitle: string;
  errorDescription: string;
  retry: string;
  total: (total: number) => string;
  sortBy: (column: string) => string;
}

export interface ListTableConfig {
  params: ListTableParams;
  texts: ListTableTexts;
  /** The first one is the default. */
  pageSizeOptions: readonly number[];
  /** Wait after the last keystroke before searching. */
  debounceMs: number;
}

export interface ListTableConfigOverrides {
  params?: Partial<ListTableParams>;
  texts?: Partial<ListTableTexts>;
  pageSizeOptions?: readonly number[];
  debounceMs?: number;
}
