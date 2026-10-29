import { booleanFilter, optionsFilter } from '@shared/list-table';
import { ECOSYSTEM_PARAMS } from './ecosystem.constants';
import { PARTNER_TYPES } from './ecosystem.enums';

/** The ecosystem's specific filters (search, pagination and sorting come from the list-table). */
export const ECOSYSTEM_FILTERS = {
  type: optionsFilter(ECOSYSTEM_PARAMS.type, PARTNER_TYPES),
  /** Only partners with an active contract. */
  activeOnly: booleanFilter(ECOSYSTEM_PARAMS.activeOnly),
};
