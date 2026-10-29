import { type IconName } from '@supermercado/ui/icon';
import { SORT_DIRECTION, type SortDirection } from './list-table.enums';
import { type ListTableConfig, type ListTableLogger } from './list-table.types';

export const FIRST_PAGE = 1;

/** Text that means "no value" in the URL. */
export const NO_VALUE = '';

/** Value of an options filter that means "all" (no filter). */
export const ALL_OPTIONS = NO_VALUE;
export type AllOptions = typeof ALL_OPTIONS;

/** How a boolean that is on travels in the query string (?lowStock=true). */
export const TRUE_PARAM = String(true);

export const DEFAULT_LIST_TABLE_CONFIG: ListTableConfig = {
  params: {
    search: 'q',
    page: 'page',
    pageSize: 'pageSize',
    sortBy: 'sortBy',
    sortDirection: 'sortDirection',
  },
  texts: {
    search: 'Pesquisar',
    searchPlaceholder: 'Pesquisar…',
    clear: 'Limpar',
    pageSize: 'Itens por página',
    refreshing: 'Atualizando…',
    empty: 'Nenhum registro encontrado.',
    errorTitle: 'Não foi possível carregar os dados',
    errorDescription: 'Verifique sua conexão e tente de novo.',
    retry: 'Tentar de novo',
    total: (total) => `${total} item(ns)`,
    sortBy: (column) => `Ordenar por ${column}`,
  },
  pageSizeOptions: [10, 20, 50],
  debounceMs: 300,
};

/** No specific filters: only search, sorting and pagination. */
export const NO_FILTERS = {};

/** Icons of the list-table's built-in parts. */
export const LIST_TABLE_ICON = {
  error: 'circle-alert',
  search: 'search',
  unsorted: 'arrow-up-down',
} as const satisfies Record<string, IconName>;

/** Sort button icon for each direction. */
export const SORT_ICON: Record<SortDirection, IconName> = {
  [SORT_DIRECTION.asc]: 'arrow-up',
  [SORT_DIRECTION.desc]: 'arrow-down',
};

/** Used when the app provides no logger (tests, other apps): logging is silent. */
export const SILENT_LOGGER: ListTableLogger = {
  debug: () => undefined,
  error: () => undefined,
};
