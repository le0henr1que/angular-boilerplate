import { effect, inject, untracked } from '@angular/core';
import {
  injectQuery,
  keepPreviousData,
  QueryClient,
  queryOptions,
} from '@tanstack/angular-query-experimental';
import { fromEvent, isObservable, lastValueFrom, takeUntil } from 'rxjs';
import {
  type ListTableRequest,
  type ListTableResult,
  type ListTableSource,
} from '../models/list-table.models';

/** AbortSignal event fired when TanStack cancels the query. */
const ABORT_EVENT = 'abort';

function listQueryOptions<T, F>(source: ListTableSource<T, F>, request: ListTableRequest<F>) {
  return queryOptions({
    queryKey: [...source.key, request],
    // If the request changes before the response arrives, the old one is cancelled (HttpClient aborts).
    queryFn: ({ signal }): Promise<ListTableResult<T>> => {
      const response = source.fetch(request);
      if (isObservable(response)) {
        return lastValueFrom(response.pipe(takeUntil(fromEvent(signal, ABORT_EVENT))));
      }
      return response;
    },
  });
}

/**
 * The list-table's TanStack Query "hook":
 *  - each request (filters + search + page + sort) is its own cache entry;
 *  - keepPreviousData: while the new one loads, the previous one stays on screen;
 *  - with pagination, prefetches the NEXT page as soon as the current one arrives.
 */
export function injectListQuery<T, F>(
  source: () => ListTableSource<T, F>,
  request: () => ListTableRequest<F>,
) {
  const queryClient = inject(QueryClient);

  const query = injectQuery(() => ({
    ...listQueryOptions(source(), request()),
    placeholderData: keepPreviousData,
  }));

  effect(() => {
    const result = query.data();
    const current = request();
    if (!result || query.isPlaceholderData() || !current.pagination) return;
    if (current.pagination.page >= result.totalPages) return;
    const next = {
      ...current,
      pagination: { ...current.pagination, page: current.pagination.page + 1 },
    };
    untracked(() => queryClient.prefetchQuery(listQueryOptions(source(), next)));
  });

  return query;
}
