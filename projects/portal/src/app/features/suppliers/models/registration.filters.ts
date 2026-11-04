import { optionsFilter } from '@shared/list-table';
import { REGISTRATION_PARAMS } from './registration.constants';
import { REGISTRATION_STATUSES } from './registration.enums';

/** Specific filters of both lists (search, pagination and sorting come from the list-table). */
export const REGISTRATION_FILTERS = {
  status: optionsFilter(REGISTRATION_PARAMS.status, REGISTRATION_STATUSES),
};
