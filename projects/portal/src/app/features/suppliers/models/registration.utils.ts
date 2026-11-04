import {
  ALL_REGISTRATION_STATUSES,
  REGISTRATION_STATUSES,
  type RegistrationStatusFilter,
} from './registration.enums';

/** Accepts only a known status; anything else (e.g. typed in the URL) means "all". */
export function toRegistrationStatusFilter(value: string | null): RegistrationStatusFilter {
  return REGISTRATION_STATUSES.find((status) => status === value) ?? ALL_REGISTRATION_STATUSES;
}
