import { ALL_OPTIONS, type AllOptions } from '@shared/list-table';

/** Registration status shared by suppliers and categories. */
export const REGISTRATION_STATUSES = ['active', 'pending', 'inactive'] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

/** Status filter value that means "every status". */
export const ALL_REGISTRATION_STATUSES = ALL_OPTIONS;
export type RegistrationStatusFilter = RegistrationStatus | AllOptions;
