import { InjectionToken, type Provider } from '@angular/core';

/** Query string name of each built-in part of the list-table. */
export interface ListTableParams {
  search: string;
  page: string;
  pageSize: string;
  sortBy: string;
  sortDirection: string;
}

/** Text shown to the user (the app's language, not the code's). */
export interface ListTableTexts {
  search: string;
  searchPlaceholder: string;
  clear: string;
  pageSize: string;
  refreshing: string;
  empty: string;
  errorTitle: string;
  errorDescription: string;
  retry: string;
  total: (total: number) => string;
  sortBy: (column: string) => string;
}

export interface ListTableConfig {
  params: ListTableParams;
  texts: ListTableTexts;
  /** The first one is the default. */
  pageSizeOptions: readonly number[];
  /** Wait after the last keystroke before searching. */
  debounceMs: number;
}

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

export const LIST_TABLE_CONFIG = new InjectionToken<ListTableConfig>('LIST_TABLE_CONFIG', {
  factory: () => DEFAULT_LIST_TABLE_CONFIG,
});

export interface ListTableConfigOverrides {
  params?: Partial<ListTableParams>;
  texts?: Partial<ListTableTexts>;
  pageSizeOptions?: readonly number[];
  debounceMs?: number;
}

/**
 * Overrides the list-table defaults. In app.config.ts it applies to the whole app; in a
 * component's `providers`, only to the list-tables inside it.
 *
 *   providers: [provideListTable({ params: { search: 'term' }, texts: { empty: 'Nada aqui.' } })]
 */
export function provideListTable(overrides: ListTableConfigOverrides): Provider {
  return {
    provide: LIST_TABLE_CONFIG,
    useValue: {
      ...DEFAULT_LIST_TABLE_CONFIG,
      ...overrides,
      params: { ...DEFAULT_LIST_TABLE_CONFIG.params, ...overrides.params },
      texts: { ...DEFAULT_LIST_TABLE_CONFIG.texts, ...overrides.texts },
    } satisfies ListTableConfig,
  };
}
