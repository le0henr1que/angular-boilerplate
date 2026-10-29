import { InjectionToken, type Signal } from '@angular/core';
import { type UrlField } from './models/url-field';

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

/** Provided by app-list-table itself; only exists inside it. */
export const LIST_TABLE_CONTEXT = new InjectionToken<ListTableContext>('LIST_TABLE_CONTEXT');
