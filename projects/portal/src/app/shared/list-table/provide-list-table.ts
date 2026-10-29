import { type Provider } from '@angular/core';
import { LIST_TABLE_CONFIG } from './list-table.tokens';
import { DEFAULT_LIST_TABLE_CONFIG } from './models/list-table.constants';
import { type ListTableConfig, type ListTableConfigOverrides } from './models/list-table.types';

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
