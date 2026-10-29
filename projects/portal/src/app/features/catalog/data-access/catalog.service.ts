import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TRUE_PARAM } from '@shared/list-table';
import { type Observable } from 'rxjs';
import { ALL_CATEGORIES } from '../models/catalog.enums';
import { CATALOG_ENDPOINT, CATALOG_PARAMS } from '../models/catalog.constants';
import { type CatalogResponse, type CatalogRequest } from '../models/catalog.types';

/**
 * Only talks to the server. In development (mockApi: true) the mock API answers
 * (src/mocks/mock-api.interceptor.ts); the screen can't tell the difference.
 *
 * The API base URL comes from apiUrlInterceptor (environment `apiUrl`): here only the resource
 * path. To call another server, pass a full URL (https://...): it goes straight to it.
 *
 *   GET {apiUrl}/catalogo?q=cafe&categoria=Bebidas&estoqueBaixo=true&pagina=2&porPagina=10&ordenarPor=price&direcao=desc
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  list({ filters, search, pagination, sort }: CatalogRequest): Observable<CatalogResponse> {
    let params = new HttpParams();
    const term = search.trim();
    if (term) params = params.set(CATALOG_PARAMS.term, term);
    if (filters.category !== ALL_CATEGORIES) {
      params = params.set(CATALOG_PARAMS.category, filters.category);
    }
    if (filters.lowStock) params = params.set(CATALOG_PARAMS.lowStock, TRUE_PARAM);
    if (pagination) {
      params = params
        .set(CATALOG_PARAMS.page, pagination.page)
        .set(CATALOG_PARAMS.pageSize, pagination.pageSize);
    }
    if (sort) {
      params = params
        .set(CATALOG_PARAMS.sortBy, sort.field)
        .set(CATALOG_PARAMS.sortDirection, sort.direction);
    }
    return this.http.get<CatalogResponse>(CATALOG_ENDPOINT, { params });
  }
}
