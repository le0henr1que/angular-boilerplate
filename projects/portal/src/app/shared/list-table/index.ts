// Public API of the list-table. Outside this folder, always import from '@shared/list-table'.
import { ListTableBooleanFilter } from './components/filters/list-table-boolean-filter/list-table-boolean-filter';
import { ListTableOptionsFilter } from './components/filters/list-table-options-filter/list-table-options-filter';
import { ListTable } from './list-table';

// Components and hooks
export { ListTableBooleanFilter } from './components/filters/list-table-boolean-filter/list-table-boolean-filter';
export { ListTableOptionsFilter } from './components/filters/list-table-options-filter/list-table-options-filter';
export { injectListTableFilter } from './hooks/inject-list-table-filter';
export { ListTable } from './list-table';

// Configuration
export { LIST_TABLE_CONFIG, LIST_TABLE_CONTEXT, LIST_TABLE_LOGGER } from './list-table.tokens';
export { provideListTable } from './provide-list-table';

// Types, enums and constants
export * from './models/list-table.constants';
export * from './models/list-table.enums';
export * from './models/list-table.types';
export * from './models/url-field.types';

// Filter factories
export * from './utils/filter.utils';

/** The container and the ready-made filters: imports: [ListTableImports, UiDataTableImports]. */
export const ListTableImports = [
  ListTable,
  ListTableOptionsFilter,
  ListTableBooleanFilter,
] as const;
