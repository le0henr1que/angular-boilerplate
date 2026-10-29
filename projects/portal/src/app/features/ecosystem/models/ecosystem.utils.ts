import { ALL_PARTNER_TYPES, PARTNER_TYPES, type PartnerTypeFilter } from './ecosystem.enums';

/** Accepts only a known type; anything else (e.g. typed in the URL) means "all". */
export function toPartnerTypeFilter(value: string | null): PartnerTypeFilter {
  return PARTNER_TYPES.find((type) => type === value) ?? ALL_PARTNER_TYPES;
}
