import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Params, type QueryParamsHandling, Router } from '@angular/router';
import { type ApplyOptions } from '../list-table.context';

/** Only the given parameters change; the others in the URL (from other parts of the screen) stay. */
const MERGE_WITH_URL: QueryParamsHandling = 'merge';

/**
 * Reads and writes the current route's query string. It is the only piece that talks to the
 * Router: the other hooks only build parameters, and whoever composes them writes everything in
 * a single navigation.
 */
export function injectUrlParams() {
  const router = inject(Router);
  const route = inject(ActivatedRoute);
  const params = toSignal(route.queryParamMap, { requireSync: true });

  return {
    /** Reads a parameter (reactive: inside a computed, recomputes when the URL changes). */
    read: (param: string): string | null => params().get(param),
    /** `null` for a parameter removes it from the URL. */
    write(changes: Params, { replaceHistory = false }: ApplyOptions = {}) {
      router.navigate([], {
        relativeTo: route,
        queryParams: changes,
        queryParamsHandling: MERGE_WITH_URL,
        replaceUrl: replaceHistory,
      });
    },
  };
}

export type UrlParams = ReturnType<typeof injectUrlParams>;
