import { ALL_OPTIONS, type AllOptions } from '@shared/list-table';

export const PARTNER_TYPES = ['supplier', 'logistics', 'payment', 'marketing'] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];

/** Type filter value that means "every type". */
export const ALL_PARTNER_TYPES = ALL_OPTIONS;
export type PartnerTypeFilter = PartnerType | AllOptions;
