import { type ListTableParams, type Sort, SORT_DIRECTION } from '@shared/list-table';
import { type BadgeVariant } from '@supermercado/ui/badge';
import {
  ALL_REGISTRATION_STATUSES,
  type RegistrationStatus,
  type RegistrationStatusFilter,
} from './registration.enums';

export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  active: 'Ativo',
  pending: 'Pendente',
  inactive: 'Inativo',
};

/** Badge color of each status. */
export const REGISTRATION_STATUS_BADGE_VARIANT: Record<RegistrationStatus, BadgeVariant> = {
  active: 'default',
  pending: 'secondary',
  inactive: 'outline',
};

/** Option labels of the status filter, "all" included. */
export const REGISTRATION_STATUS_FILTER_LABEL: Record<RegistrationStatusFilter, string> = {
  [ALL_REGISTRATION_STATUSES]: 'Todas',
  ...REGISTRATION_STATUS_LABEL,
};

/** Resource paths, relative to the API base URL (see core/http/api-url.interceptor.ts). */
export const SUPPLIERS_ENDPOINT = 'fornecedores';
export const CATEGORIES_ENDPOINT = 'categorias';

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

/**
 * Query string names shared by the suppliers and categories lists, both in the screen URL and in
 * the API call: ?q=&situacao=&pagina=&porPagina=&ordenarPor=&direcao=
 */
export const REGISTRATION_PARAMS = {
  term: 'q',
  status: 'situacao',
  page: 'pagina',
  pageSize: 'porPagina',
  sortBy: 'ordenarPor',
  sortDirection: 'direcao',
} as const;

/** The list-tables use the same names as the API (see provideListTable in the pages). */
export const REGISTRATION_LIST_TABLE_PARAMS: ListTableParams = {
  search: REGISTRATION_PARAMS.term,
  page: REGISTRATION_PARAMS.page,
  pageSize: REGISTRATION_PARAMS.pageSize,
  sortBy: REGISTRATION_PARAMS.sortBy,
  sortDirection: REGISTRATION_PARAMS.sortDirection,
};

/** Column the lists start sorted by when the URL has no sort. */
export const DEFAULT_SORT: Sort = { field: 'name', direction: SORT_DIRECTION.asc };

/** Child routes of the suppliers area (the URLs stay in Portuguese). */
export const SUPPLIERS_ROUTE = {
  suppliers: '',
  categories: 'categorias',
} as const;
