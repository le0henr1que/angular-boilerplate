import { type ListTableParams, type Sort, SORT_DIRECTION } from '@shared/list-table';
import { type BadgeVariant } from '@supermercado/ui/badge';
import { ALL_PARTNER_TYPES, type PartnerType, type PartnerTypeFilter } from './ecosystem.enums';

/** Resource path, relative to the API base URL (see core/http/api-url.interceptor.ts). */
export const ECOSYSTEM_ENDPOINT = 'ecossistema';

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

/**
 * Query string names, both in the screen URL and in the API call (URL values, kept as they are):
 *   ?q=log&tipo=logistics&ativos=true&pagina=2&porPagina=25&ordenarPor=partnerSince&direcao=desc
 */
export const ECOSYSTEM_PARAMS = {
  term: 'q',
  type: 'tipo',
  activeOnly: 'ativos',
  page: 'pagina',
  pageSize: 'porPagina',
  sortBy: 'ordenarPor',
  sortDirection: 'direcao',
} as const;

/** The screen's list-table uses the same names as the API (see provideListTable in ecosystem-page.ts). */
export const ECOSYSTEM_LIST_TABLE_PARAMS: ListTableParams = {
  search: ECOSYSTEM_PARAMS.term,
  page: ECOSYSTEM_PARAMS.page,
  pageSize: ECOSYSTEM_PARAMS.pageSize,
  sortBy: ECOSYSTEM_PARAMS.sortBy,
  sortDirection: ECOSYSTEM_PARAMS.sortDirection,
};

/** Column the list starts sorted by when the URL has no sort. */
export const DEFAULT_SORT: Sort = { field: 'name', direction: SORT_DIRECTION.asc };

export const PARTNER_TYPE_LABEL: Record<PartnerType, string> = {
  supplier: 'Fornecedor',
  logistics: 'Logística',
  payment: 'Pagamentos',
  marketing: 'Marketing',
};

/** Badge color of each partner type. */
export const PARTNER_TYPE_BADGE_VARIANT: Record<PartnerType, BadgeVariant> = {
  supplier: 'default',
  logistics: 'secondary',
  payment: 'outline',
  marketing: 'secondary',
};

/** Option labels of the type filter, "all" included. */
export const PARTNER_TYPE_FILTER_LABEL: Record<PartnerTypeFilter, string> = {
  [ALL_PARTNER_TYPES]: 'Todos',
  ...PARTNER_TYPE_LABEL,
};
