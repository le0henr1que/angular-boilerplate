import { type FieldValues, type ListTableRequest, type ListTableResult } from '@shared/list-table';
import { type PartnerType } from './ecosystem.enums';
import { type ECOSYSTEM_FILTERS } from './ecosystem.filters';

/** A company of the supermarket ecosystem, as the API returns it. */
export interface EcosystemPartner {
  id: number;
  name: string;
  type: PartnerType;
  contact: { name: string; email: string };
  location: { city: string; state: string };
  /** ISO date (yyyy-mm-dd). */
  partnerSince: string;
  active: boolean;
}

/** Paginated response of GET {apiUrl}/ecossistema: only the requested page, plus the totals. */
export interface EcosystemResponse extends ListTableResult<EcosystemPartner> {
  items: EcosystemPartner[];
  page: number;
  pageSize: number;
}

export type EcosystemFilters = FieldValues<typeof ECOSYSTEM_FILTERS>;

/** What the screen asks the API for. Also the cache key (see ecosystem.queries.ts). */
export type EcosystemRequest = ListTableRequest<EcosystemFilters>;
