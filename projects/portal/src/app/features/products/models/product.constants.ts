import { type BadgeVariant } from '@supermercado/ui/badge';
import { ALL_STATUSES, type ProductStatus } from './product.enums';
import { type ProductFilters } from './product.types';

export const EMPTY_FILTERS: ProductFilters = { term: '', status: ALL_STATUSES };

/** Query string names, both in the screen URL and in the API call (kept as they are). */
export const PRODUCT_PARAMS = {
  term: 'q',
  status: 'status',
} as const;

/** Resource path, relative to the API base URL (see core/http/api-url.interceptor.ts). */
export const PRODUCTS_ENDPOINT = 'produtos';

export const STATUS_LABEL: Record<ProductStatus, string> = {
  available: 'Disponível',
  low: 'Estoque baixo',
  'out-of-stock': 'Esgotado',
};

/** Badge color of each status. */
export const STATUS_BADGE_VARIANT: Record<ProductStatus, BadgeVariant> = {
  available: 'default',
  low: 'secondary',
  'out-of-stock': 'destructive',
};
