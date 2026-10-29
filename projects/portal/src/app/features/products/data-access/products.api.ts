import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ALL_STATUSES } from '../models/product.enums';
import { PRODUCT_PARAMS, PRODUCTS_ENDPOINT } from '../models/product.constants';
import { type Product, type ProductFilters } from '../models/product.types';

/**
 * Only talks to the server. Keeps no state or cache — that's TanStack Query's job
 * (see products.queries.ts). Returns Promises because that's what TanStack expects, as in React.
 * The API base URL is added by apiUrlInterceptor: here only the resource path.
 */
@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);

  list(filters: ProductFilters): Promise<Product[]> {
    let params = new HttpParams();
    if (filters.term) params = params.set(PRODUCT_PARAMS.term, filters.term);
    if (filters.status !== ALL_STATUSES) params = params.set(PRODUCT_PARAMS.status, filters.status);
    return lastValueFrom(this.http.get<Product[]>(PRODUCTS_ENDPOINT, { params }));
  }

  get(code: string): Promise<Product> {
    return lastValueFrom(
      this.http.get<Product>(`${PRODUCTS_ENDPOINT}/${encodeURIComponent(code)}`),
    );
  }
}
