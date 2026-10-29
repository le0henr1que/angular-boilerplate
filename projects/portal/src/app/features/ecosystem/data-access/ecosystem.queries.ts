import { inject } from '@angular/core';
import { type ListTableSource } from '@shared/list-table';
import { type EcosystemFilters, type EcosystemPartner } from '../models/ecosystem.types';
import { EcosystemService } from './ecosystem.service';

/** Cache keys (TanStack Query). The list-table appends the full request to `lists()`. */
export const ecosystemKeys = {
  all: ['ecosystem'] as const,
  lists: () => [...ecosystemKeys.all, 'list'] as const,
};

/** Where the ecosystem list-table gets its data. Can only be called at component creation. */
export function injectEcosystemSource(): ListTableSource<EcosystemPartner, EcosystemFilters> {
  const service = inject(EcosystemService);
  return {
    key: ecosystemKeys.lists(),
    // The API response already has the list-table shape ({ items, total, totalPages }).
    fetch: (request) => service.list(request),
  };
}
