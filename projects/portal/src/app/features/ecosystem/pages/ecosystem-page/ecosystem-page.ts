import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type ListTableColumn, ListTableImports, provideListTable } from '@shared/list-table';
import { UiBadge } from '@supermercado/ui/badge';
import { UiDataTableImports } from '@supermercado/ui/data-table';
import { injectEcosystemSource } from '../../data-access/ecosystem.queries';
import {
  DEFAULT_SORT,
  ECOSYSTEM_LIST_TABLE_PARAMS,
  PAGE_SIZE_OPTIONS,
  PARTNER_TYPE_FILTER_LABEL,
} from '../../models/ecosystem.constants';
import { ECOSYSTEM_FILTERS } from '../../models/ecosystem.filters';
import { type EcosystemPartner } from '../../models/ecosystem.types';
import {
  ALL_PARTNER_TYPES,
  PARTNER_TYPES,
  type PartnerTypeFilter,
} from '../../models/ecosystem.enums';
import { PartnerTypeBadge } from '../../ui/partner-type-badge';
import { ECOSYSTEM_COLUMN } from './ecosystem-page.constants';

/**
 * The supermarket ecosystem: suppliers, logistics, payments and marketing partners.
 * The screen only says WHAT to list; search, sorting, pagination, states and cache come from
 * app-list-table.
 */
@Component({
  selector: 'app-ecosystem-page',
  imports: [DatePipe, ListTableImports, PartnerTypeBadge, UiBadge, UiDataTableImports],
  // The screen URL uses the same parameter names as the API (?tipo=&ativos=&pagina=...).
  providers: [provideListTable({ params: ECOSYSTEM_LIST_TABLE_PARAMS })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ecosystem-page.html',
  styleUrl: './ecosystem-page.scss',
})
export default class EcosystemPage {
  protected readonly source = injectEcosystemSource();
  protected readonly filters = ECOSYSTEM_FILTERS;
  protected readonly partnerTypes = PARTNER_TYPES;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly defaultSort = DEFAULT_SORT;
  protected readonly column = ECOSYSTEM_COLUMN;
  protected readonly allTypesLabel = PARTNER_TYPE_FILTER_LABEL[ALL_PARTNER_TYPES];
  protected readonly typeLabel = (type: PartnerTypeFilter) => PARTNER_TYPE_FILTER_LABEL[type];

  protected readonly columns: ListTableColumn<EcosystemPartner>[] = [
    { key: 'name', title: 'Parceiro', sortable: true },
    { key: ECOSYSTEM_COLUMN.type, title: 'Tipo', sortable: true },
    {
      key: 'location.city',
      title: 'Cidade',
      sortable: true,
      format: (city, partner) => `${city}/${partner.location.state}`,
    },
    { key: ECOSYSTEM_COLUMN.contact, title: 'Contato' },
    { key: ECOSYSTEM_COLUMN.partnerSince, title: 'Parceiro desde', align: 'end', sortable: true },
    { key: ECOSYSTEM_COLUMN.active, title: 'Situação', align: 'center' },
  ];
}
