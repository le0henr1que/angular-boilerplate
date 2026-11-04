import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable } from 'rxjs';
import {
  CATEGORIES_ENDPOINT,
  REGISTRATION_PARAMS,
  SUPPLIERS_ENDPOINT,
} from '../models/registration.constants';
import { ALL_REGISTRATION_STATUSES } from '../models/registration.enums';
import {
  type CategoryResponse,
  type RegistrationRequest,
  type SupplierResponse,
} from '../models/registration.types';

/**
 * Only talks to the server. In development (mockApi: true) the mock API answers
 * (src/mocks/mock-api.interceptor.ts). The base URL comes from apiUrlInterceptor.
 *
 *   GET {apiUrl}/fornecedores?q=vale&situacao=active&pagina=1&porPagina=10&ordenarPor=name&direcao=asc
 *   GET {apiUrl}/categorias?q=lat&situacao=pending&pagina=1&porPagina=10&ordenarPor=productCount&direcao=desc
 */
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly http = inject(HttpClient);

  listSuppliers(request: RegistrationRequest): Observable<SupplierResponse> {
    return this.http.get<SupplierResponse>(SUPPLIERS_ENDPOINT, { params: toParams(request) });
  }

  listCategories(request: RegistrationRequest): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(CATEGORIES_ENDPOINT, { params: toParams(request) });
  }
}

/** Both lists take the same query string. */
function toParams({ filters, search, pagination, sort }: RegistrationRequest): HttpParams {
  let params = new HttpParams();
  const term = search.trim();
  if (term) params = params.set(REGISTRATION_PARAMS.term, term);
  if (filters.status !== ALL_REGISTRATION_STATUSES) {
    params = params.set(REGISTRATION_PARAMS.status, filters.status);
  }
  if (pagination) {
    params = params
      .set(REGISTRATION_PARAMS.page, pagination.page)
      .set(REGISTRATION_PARAMS.pageSize, pagination.pageSize);
  }
  if (sort) {
    params = params
      .set(REGISTRATION_PARAMS.sortBy, sort.field)
      .set(REGISTRATION_PARAMS.sortDirection, sort.direction);
  }
  return params;
}
