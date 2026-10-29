import { inject } from '@angular/core';
import {
  injectQuery,
  keepPreviousData,
  QueryClient,
  queryOptions,
} from '@tanstack/angular-query-experimental';
import { type ProductFilters } from '../models/product.types';
import { ProductsApi } from './products.api';

/*
 * The same TanStack Query model as in React. Side by side:
 *
 *   React                                   Angular (this file)
 *   ─────────────────────────────────────   ─────────────────────────────────────────
 *   function useProducts(filters) {         function injectProducts(filters) {
 *     return useQuery({ queryKey, ... })      return injectQuery(() => ({ queryKey, ... }))
 *   }                                       }
 *   const { data, isPending } = useProducts(f)   readonly products = injectProducts(this.filters)
 *   data / isPending (values)                    products.data() / products.isPending() (signals)
 *
 * In Angular the "hooks" are called inject*() and work in the same place React allows hooks:
 * at component creation (field initializer or constructor).
 * The difference: instead of running again on every render, injectQuery receives a FUNCTION.
 * When a signal read inside it changes (e.g. the filters), the query switches keys on its own.
 */

/** Cache keys. Organized as a factory, as the TanStack docs recommend. */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  detail: (code: string) => [...productKeys.all, 'detail', code] as const,
};

/**
 * queryOptions keeps key + function in one place, to be used both in the hook
 * and in direct cache calls (prefetch, invalidate…).
 */
export const productQueries = {
  list: (api: ProductsApi, filters: ProductFilters) =>
    queryOptions({
      queryKey: productKeys.list(filters),
      queryFn: () => api.list(filters),
    }),
  detail: (api: ProductsApi, code: string) =>
    queryOptions({
      queryKey: productKeys.detail(code),
      queryFn: () => api.get(code),
    }),
};

/** Listing hook. Each combination of filters has its own cache. */
export function injectProducts(filters: () => ProductFilters) {
  const api = inject(ProductsApi);
  return injectQuery(() => ({
    ...productQueries.list(api, filters()),
    // When the filter changes, keeps the previous table on screen until the new response arrives
    // (instead of flashing "loading"). Same as React's placeholderData.
    placeholderData: keepPreviousData,
  }));
}

/** Hook for a product's detail. */
export function injectProduct(code: () => string) {
  const api = inject(ProductsApi);
  return injectQuery(() => productQueries.detail(api, code()));
}

/**
 * Hook that returns a function to preload the detail (e.g. when hovering the row).
 * When the user clicks, the data is already in the cache and the page opens right away.
 */
export function injectProductPrefetch() {
  const api = inject(ProductsApi);
  const queryClient = inject(QueryClient);
  return (code: string) => queryClient.prefetchQuery(productQueries.detail(api, code));
}
