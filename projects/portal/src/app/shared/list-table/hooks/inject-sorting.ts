import { computed } from '@angular/core';
import { type Params } from '@angular/router';
import { SORT_DIRECTION, type SortDirection } from '../models/list-table.enums';
import { type Sort } from '../models/list-table.types';
import { type SortingConfig } from './hooks.types';
import { type UrlParams } from './inject-url-params';

const DIRECTIONS: readonly SortDirection[] = Object.values(SORT_DIRECTION);

/** Clicking the same header: ascending → descending → no sort (back to the default). */
const NEXT_DIRECTION: Record<SortDirection, SortDirection | null> = {
  [SORT_DIRECTION.asc]: SORT_DIRECTION.desc,
  [SORT_DIRECTION.desc]: null,
};

function toDirection(text: string | null): SortDirection {
  return DIRECTIONS.find((direction) => direction === text) ?? SORT_DIRECTION.asc;
}

/** Sorting "hook" in the URL (?sortBy=price&sortDirection=desc). When disabled, the state is null. */
export function injectSorting(url: UrlParams, config: SortingConfig) {
  const state = computed<Sort | null>(
    () => {
      if (!config.enabled()) return null;
      const field = url.read(config.fieldParam);
      if (field === null || !config.fields().includes(field)) return config.defaultSort();
      return { field, direction: toDirection(url.read(config.directionParam)) };
    },
    { equal: (a, b) => a?.field === b?.field && a?.direction === b?.direction },
  );

  function toParams(sort: Sort | null): Params {
    if (!sort) return { [config.fieldParam]: null, [config.directionParam]: null };
    return { [config.fieldParam]: sort.field, [config.directionParam]: sort.direction };
  }

  /** The next step of the cycle when clicking the header of `field`. */
  function next(field: string): Sort | null {
    const current = state();
    if (current?.field !== field) return { field, direction: SORT_DIRECTION.asc };
    const direction = NEXT_DIRECTION[current.direction];
    if (!direction) return null;
    return { field, direction };
  }

  return {
    state,
    clickParams: (field: string): Params => toParams(next(field)),
  };
}
