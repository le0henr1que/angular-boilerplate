import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TRUE_PARAM } from '@shared/list-table';
import { type Observable } from 'rxjs';
import { ALL_PARTNER_TYPES } from '../models/ecosystem.enums';
import { ECOSYSTEM_ENDPOINT, ECOSYSTEM_PARAMS } from '../models/ecosystem.constants';
import { type EcosystemRequest, type EcosystemResponse } from '../models/ecosystem.types';

/**
 * Only talks to the server. In development (mockApi: true) the mock API answers
 * (src/mocks/mock-api.interceptor.ts). The base URL comes from apiUrlInterceptor.
 *
 *   GET {apiUrl}/ecossistema?q=log&tipo=logistics&ativos=true&pagina=1&porPagina=10&ordenarPor=name&direcao=asc
 */
@Injectable({ providedIn: 'root' })
export class EcosystemService {
  private readonly http = inject(HttpClient);

  list({ filters, search, pagination, sort }: EcosystemRequest): Observable<EcosystemResponse> {
    let params = new HttpParams();
    const term = search.trim();
    if (term) params = params.set(ECOSYSTEM_PARAMS.term, term);
    if (filters.type !== ALL_PARTNER_TYPES) {
      params = params.set(ECOSYSTEM_PARAMS.type, filters.type);
    }
    if (filters.activeOnly) params = params.set(ECOSYSTEM_PARAMS.activeOnly, TRUE_PARAM);
    if (pagination) {
      params = params
        .set(ECOSYSTEM_PARAMS.page, pagination.page)
        .set(ECOSYSTEM_PARAMS.pageSize, pagination.pageSize);
    }
    if (sort) {
      params = params
        .set(ECOSYSTEM_PARAMS.sortBy, sort.field)
        .set(ECOSYSTEM_PARAMS.sortDirection, sort.direction);
    }
    return this.http.get<EcosystemResponse>(ECOSYSTEM_ENDPOINT, { params });
  }
}
