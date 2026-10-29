import { computed } from '@angular/core';
import { type Params } from '@angular/router';
import { FIRST_PAGE } from '../models/list-table.constants';
import { type Pagination } from '../models/list-table.types';
import { type UrlField } from '../models/url-field.types';
import { numberFilter } from '../utils/filter.utils';
import { fieldToParam, readField } from '../utils/url-field.utils';
import { type PaginationConfig } from './hooks.types';
import { type UrlParams } from './inject-url-params';

/** Page in the URL: an integer from the first page on; anything else becomes the first page. */
function pageField(param: string): UrlField<number> {
  return {
    param,
    defaultValue: FIRST_PAGE,
    parse: (text) => {
      const page = Number(text);
      if (Number.isInteger(page) && page > FIRST_PAGE) return page;
      return FIRST_PAGE;
    },
  };
}

/** Pagination "hook" in the URL (?page=2&pageSize=20). When disabled, the state is null. */
export function injectPagination(url: UrlParams, config: PaginationConfig) {
  const page = pageField(config.pageParam);
  const pageSize = computed(() => {
    const options = config.pageSizeOptions();
    return numberFilter(config.pageSizeParam, options[0], options);
  });

  const state = computed<Pagination | null>(
    () => {
      if (!config.enabled()) return null;
      return { page: readField(page, url.read), pageSize: readField(pageSize(), url.read) };
    },
    { equal: (a, b) => a?.page === b?.page && a?.pageSize === b?.pageSize },
  );

  return {
    state,
    pageParams: (value: number): Params => ({
      [page.param]: fieldToParam(page, Math.max(FIRST_PAGE, value)),
    }),
    /** A page size outside the options becomes the default. Also goes back to the first page. */
    pageSizeParams: (size: number): Params => {
      const field = pageSize();
      return {
        [field.param]: fieldToParam(field, field.parse(String(size))),
        [page.param]: null,
      };
    },
    /** Together with any filter/search/sort change: the result changed. */
    firstPageParams: (): Params => ({ [page.param]: null }),
  };
}
