import { computed, inject } from '@angular/core';
import { type ApplyOptions, LIST_TABLE_CONTEXT } from '../list-table.context';
import { type UrlField } from '../models/url-field';

/**
 * "Hook" for building a new filter: call it in the filter component, which must be INSIDE an
 * <app-list-table> (as a child). It reads and writes the value through the list-table, which
 * handles the URL, going back to page 1, "Clear", and sending the value to the data source.
 *
 *   export class StoreFilter {
 *     readonly filter = input.required<UrlField<number>>();
 *     protected readonly store = injectListTableFilter(this.filter);
 *     // template: [value]="store.value()" (change)="onChange($event)"
 *   }
 */
export function injectListTableFilter<V>(field: () => UrlField<V>) {
  const context = inject(LIST_TABLE_CONTEXT);

  return {
    value: computed(() => context.filterValue(field())),
    set: (value: V, options?: ApplyOptions) => context.applyFilter(field(), value, options),
    clear: () => context.applyFilter(field(), field().defaultValue),
  };
}
