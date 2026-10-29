import { InjectionToken } from '@angular/core';
import { DEFAULT_LIST_TABLE_CONFIG, SILENT_LOGGER } from './models/list-table.constants';
import {
  type ListTableConfig,
  type ListTableContext,
  type ListTableLogger,
} from './models/list-table.types';

/** Defaults of every list-table (params, texts, page sizes). Override with provideListTable(). */
export const LIST_TABLE_CONFIG = new InjectionToken<ListTableConfig>('LIST_TABLE_CONFIG', {
  factory: () => DEFAULT_LIST_TABLE_CONFIG,
});

/** Provided by app-list-table itself; only exists inside it (the projected filters inject it). */
export const LIST_TABLE_CONTEXT = new InjectionToken<ListTableContext>('LIST_TABLE_CONTEXT');

/**
 * Where the list-table logs. shared/ can't depend on core/, so the app plugs in its Logger
 * (see app.config.ts):
 *
 *   { provide: LIST_TABLE_LOGGER, useFactory: () => inject(Logger).withContext('list-table') }
 *
 * Without a provider (tests, other apps), logging is silent.
 */
export const LIST_TABLE_LOGGER = new InjectionToken<ListTableLogger>('LIST_TABLE_LOGGER', {
  factory: () => SILENT_LOGGER,
});
