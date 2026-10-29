// Public API of the list-table. Outside this folder, always import from '@shared/list-table'.
import { ListTableBooleanFilter } from './components/filters/list-table-boolean-filter/list-table-boolean-filter';
import { ListTableOptionsFilter } from './components/filters/list-table-options-filter/list-table-options-filter';
import { ListTable } from './list-table';

export { ListTableBooleanFilter } from './components/filters/list-table-boolean-filter/list-table-boolean-filter';
export { ListTableOptionsFilter } from './components/filters/list-table-options-filter/list-table-options-filter';
export { injectListTableFilter } from './hooks/inject-list-table-filter';
export { ListTable } from './list-table';
export {
  DEFAULT_LIST_TABLE_CONFIG,
  LIST_TABLE_CONFIG,
  type ListTableConfig,
  type ListTableConfigOverrides,
  type ListTableParams,
  type ListTableTexts,
  provideListTable,
} from './list-table.config';
export { type ApplyOptions, LIST_TABLE_CONTEXT, type ListTableContext } from './list-table.context';
export {
  ALL_OPTIONS,
  type AllOptions,
  booleanFilter,
  defineFilter,
  numberFilter,
  optionsFilter,
  textFilter,
  TRUE_PARAM,
} from './models/filters';
export {
  FIRST_PAGE,
  type ListTableColumn,
  type ListTableRequest,
  type ListTableResult,
  type ListTableSource,
  type Pagination,
  type Sort,
  SORT_DIRECTION,
  type SortDirection,
} from './models/list-table.models';
export { type FieldValues, NO_VALUE, type UrlField, type UrlFields } from './models/url-field';

/** The container and the ready-made filters: imports: [ListTableImports, UiDataTableImports]. */
export const ListTableImports = [
  ListTable,
  ListTableOptionsFilter,
  ListTableBooleanFilter,
] as const;
