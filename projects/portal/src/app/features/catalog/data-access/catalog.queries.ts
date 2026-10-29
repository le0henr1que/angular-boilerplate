import { inject } from '@angular/core';
import { type ListTableSource } from '@shared/list-table';
import { type CatalogFilters, type CatalogItem } from '../models/catalog.types';
import { CatalogService } from './catalog.service';

/*
 * Catalog cache in TanStack Query (same pattern as products.queries.ts).
 * The list-table keeps the result in the global QueryClient under the key
 * [...catalogKeys.lists(), request]: each combination of search + filters + page + sort is its
 * own entry, and leaving and coming back to the screen within the staleTime
 * (core/query/query-client.ts) shows the cache without calling the API.
 */

export const catalogKeys = {
  all: ['catalog'] as const,
  lists: () => [...catalogKeys.all, 'list'] as const,
};

/** Where the catalog list-table gets its data. Can only be called at component creation. */
export function injectCatalogSource(): ListTableSource<CatalogItem, CatalogFilters> {
  const service = inject(CatalogService);
  return {
    key: catalogKeys.lists(),
    // The API response already has the list-table shape ({ items, total, totalPages }).
    fetch: (request) => service.list(request),
  };
}
