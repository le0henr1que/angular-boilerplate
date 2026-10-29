import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ALL_STATUSES } from '../models/product.enums';
import { EMPTY_FILTERS, PRODUCT_PARAMS } from '../models/product.constants';
import { type ProductFilters } from '../models/product.types';
import { toStatusFilter } from '../models/product.utils';

/**
 * Listing filters "hook" — the equivalent of a useProductFilters() in React.
 *
 * The state lives in the URL (?q=banana&status=available), as a useSearchParams would do:
 *  - reloading the page or sharing the link keeps the search;
 *  - the browser's "back" button undoes the last filter.
 *
 * Like every inject*(), it can only be called at component creation.
 */
export function injectProductFilters() {
  const router = inject(Router);
  const route = inject(ActivatedRoute);
  const params = toSignal(route.queryParamMap, { requireSync: true });

  const filters = computed<ProductFilters>(() => ({
    term: params().get(PRODUCT_PARAMS.term) ?? EMPTY_FILTERS.term,
    // Ignores invalid values typed in the URL (e.g. ?status=xyz).
    status: toStatusFilter(params().get(PRODUCT_PARAMS.status)),
  }));

  function update(changes: Partial<ProductFilters>) {
    const next = { ...filters(), ...changes };
    router.navigate([], {
      relativeTo: route,
      // null removes the parameter from the URL, so it stays clean when there is no filter.
      queryParams: {
        [PRODUCT_PARAMS.term]: next.term.trim() || null,
        [PRODUCT_PARAMS.status]: next.status === ALL_STATUSES ? null : next.status,
      },
    });
  }

  return {
    /** Applied filters (signal). Use it as the query dependency. */
    filters,
    hasFilter: computed(
      () => filters().term !== EMPTY_FILTERS.term || filters().status !== EMPTY_FILTERS.status,
    ),
    search: (term: string) => update({ term }),
    filterByStatus: (status: ProductFilters['status']) => update({ status }),
    clear: () => update(EMPTY_FILTERS),
  };
}
