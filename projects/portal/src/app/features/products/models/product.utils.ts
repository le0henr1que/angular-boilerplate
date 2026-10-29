import { ALL_STATUSES, PRODUCT_STATUSES, type StatusFilter } from './product.enums';

/** Accepts only a known status; anything else (e.g. typed in the URL) means "all". */
export function toStatusFilter(value: string | null): StatusFilter {
  return PRODUCT_STATUSES.find((status) => status === value) ?? ALL_STATUSES;
}
