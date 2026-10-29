import { booleanFilter, optionsFilter } from '@shared/list-table';
import { CATALOG_PARAMS } from './catalog.constants';
import { CATALOG_CATEGORIES } from './catalog.enums';

/** The catalog's specific filters (search, pagination and sorting come from the list-table). */
export const CATALOG_FILTERS = {
  category: optionsFilter(CATALOG_PARAMS.category, CATALOG_CATEGORIES),
  /** Only items with stock at the minimum or below it. */
  lowStock: booleanFilter(CATALOG_PARAMS.lowStock),
};
