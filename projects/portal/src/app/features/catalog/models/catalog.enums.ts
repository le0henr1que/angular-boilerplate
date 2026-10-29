import { ALL_OPTIONS } from '@shared/list-table';

export const CATALOG_CATEGORIES = ['Hortifruti', 'Padaria', 'Bebidas', 'Limpeza'] as const;
export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

/** Category filter value that means "all" (no filter). */
export const ALL_CATEGORIES = ALL_OPTIONS;
