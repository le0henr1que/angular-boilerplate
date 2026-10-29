import {
  HttpErrorResponse,
  type HttpInterceptorFn,
  type HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { AUTH_MODE } from '@core/config/app-config.enums';
import { Logger } from '@core/logging/logger';
import {
  CATALOG_ENDPOINT,
  CATALOG_PARAMS,
  type CatalogResponse,
  DEFAULT_PAGE_SIZE,
  isLowStock,
} from '@features/catalog';
import {
  ALL_PARTNER_TYPES,
  DEFAULT_PAGE_SIZE as ECOSYSTEM_DEFAULT_PAGE_SIZE,
  ECOSYSTEM_ENDPOINT,
  ECOSYSTEM_PARAMS,
  type EcosystemResponse,
  toPartnerTypeFilter,
} from '@features/ecosystem';
import {
  PRODUCT_PARAMS,
  PRODUCTS_ENDPOINT,
  toStatusFilter,
  ALL_STATUSES,
} from '@features/products';
import { FIRST_PAGE, SORT_DIRECTION, TRUE_PARAM } from '@shared/list-table';
import { readPath } from '@supermercado/ui/data-table';
import { delay, of, throwError } from 'rxjs';
import { CATALOG_DB } from './catalog.db';
import { type PagedResponse, type PagingParams } from './mock-api.types';
import { ECOSYSTEM_DB } from './ecosystem.db';
import { readMockSession } from './mock-session';
import { PRODUCTS_DB } from './products.db';

/** Simulated latency, so the loading states and the cache effect are visible. */
const LATENCY_MS = 800;

/** Maximum page size the API accepts (the front end only uses PAGE_SIZE_OPTIONS). */
const MAX_PAGE_SIZE = 100;

/** Removes accents and case: "Maçã" and "maca" find the same product. */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(Math.trunc(value), min), max);

const respond = <T>(body: T) => of(new HttpResponse({ status: 200, body })).pipe(delay(LATENCY_MS));
const notFound = (url: string) =>
  throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url })).pipe(
    delay(LATENCY_MS),
  );

/** Number from a parameter; missing, zero or non-numeric becomes the default. */
function numberOrDefault(value: string | null, fallback: number): number {
  const number = Number(value);
  if (Number.isNaN(number) || number === 0) return fallback;
  return number;
}

/** Comparison multiplier: ascending keeps it, descending inverts it. */
const ASCENDING = 1;
const DIRECTION_SIGN = new Map<string | null, number>([
  [SORT_DIRECTION.asc, ASCENDING],
  [SORT_DIRECTION.desc, -ASCENDING],
]);

/** Sorts by an item path ("stock.quantity"); without a path, keeps the database order. */
function sortByPath<T>(items: T[], params: HttpParams, names: PagingParams): T[] {
  const path = params.get(names.sortBy);
  if (!path) return items;
  const sign = DIRECTION_SIGN.get(params.get(names.sortDirection)) ?? ASCENDING;
  return [...items].sort((a, b) => {
    const valueA = readPath(a, path);
    const valueB = readPath(b, path);
    if (typeof valueA === 'number' && typeof valueB === 'number') return (valueA - valueB) * sign;
    return String(valueA).localeCompare(String(valueB), 'pt-BR') * sign;
  });
}

/** Sorts and paginates ON THE SERVER, like the real API; the front end only gets the requested page. */
function toPage<T>(
  filtered: T[],
  params: HttpParams,
  names: PagingParams,
  defaultPageSize: number,
): PagedResponse<T> {
  const pageSize = clamp(
    numberOrDefault(params.get(names.pageSize), defaultPageSize),
    FIRST_PAGE,
    MAX_PAGE_SIZE,
  );
  const totalPages = Math.max(FIRST_PAGE, Math.ceil(filtered.length / pageSize));
  const page = clamp(numberOrDefault(params.get(names.page), FIRST_PAGE), FIRST_PAGE, totalPages);
  const start = (page - FIRST_PAGE) * pageSize;
  return {
    items: sortByPath(filtered, params, names).slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    totalPages,
  };
}

/** GET /catalogo: filters by term, category and low stock. */
function listCatalog(params: HttpParams): CatalogResponse {
  const term = normalize(params.get(CATALOG_PARAMS.term) ?? '');
  const category = params.get(CATALOG_PARAMS.category);
  const lowStock = params.get(CATALOG_PARAMS.lowStock) === TRUE_PARAM;
  const filtered = CATALOG_DB.filter(
    (item) =>
      (!term || normalize(`${item.name} ${item.supplier.name}`).includes(term)) &&
      (!category || item.category.name === category) &&
      (!lowStock || isLowStock(item)),
  );
  return toPage(filtered, params, CATALOG_PARAMS, DEFAULT_PAGE_SIZE);
}

/** GET /ecossistema: filters by term (partner, contact or city), type and active partners only. */
function listEcosystem(params: HttpParams): EcosystemResponse {
  const term = normalize(params.get(ECOSYSTEM_PARAMS.term) ?? '');
  const type = toPartnerTypeFilter(params.get(ECOSYSTEM_PARAMS.type));
  const activeOnly = params.get(ECOSYSTEM_PARAMS.activeOnly) === TRUE_PARAM;
  const filtered = ECOSYSTEM_DB.filter(
    (partner) =>
      (!term ||
        normalize(`${partner.name} ${partner.contact.name} ${partner.location.city}`).includes(
          term,
        )) &&
      (type === ALL_PARTNER_TYPES || partner.type === type) &&
      (!activeOnly || partner.active),
  );
  return toPage(filtered, params, ECOSYSTEM_PARAMS, ECOSYSTEM_DEFAULT_PAGE_SIZE);
}

/**
 * Mock API to develop without a backend. Only registered when `mockApi: true`
 * in the environment (see app.config.ts). Answers as the real REST API would:
 *
 *   GET {apiUrl}/produtos?q=text&status=available
 *   GET {apiUrl}/produtos/:code
 *   GET {apiUrl}/catalogo?q=text&categoria=Bebidas&estoqueBaixo=true&pagina=2&porPagina=10&ordenarPor=price&direcao=desc
 *   GET {apiUrl}/ecossistema?q=text&tipo=logistics&ativos=true&pagina=1&porPagina=10&ordenarPor=name&direcao=asc
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiUrl, auth, features } = inject(APP_CONFIG);
  if (!req.url.startsWith(`${apiUrl}/`) || req.method !== 'GET') return next(req);

  const route = req.url.slice(apiUrl.length + 1);
  inject(Logger).withContext('mock-api').debug(`${req.method} ${req.urlWithParams}`);

  // Like the real API: without a valid session cookie, 401 (authInterceptor sends to the login).
  if (features.authentication && auth.mode === AUTH_MODE.mock && !readMockSession()) {
    return throwError(
      () => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized', url: req.url }),
    ).pipe(delay(LATENCY_MS));
  }

  if (route === PRODUCTS_ENDPOINT) {
    const term = normalize(req.params.get(PRODUCT_PARAMS.term) ?? '');
    const status = toStatusFilter(req.params.get(PRODUCT_PARAMS.status));
    return respond(
      PRODUCTS_DB.filter(
        (p) =>
          (!term || normalize(`${p.code} ${p.name} ${p.category}`).includes(term)) &&
          (status === ALL_STATUSES || p.status === status),
      ),
    );
  }

  if (route === CATALOG_ENDPOINT) return respond(listCatalog(req.params));
  if (route === ECOSYSTEM_ENDPOINT) return respond(listEcosystem(req.params));

  const detail = route.match(new RegExp(`^${PRODUCTS_ENDPOINT}/([^/]+)$`));
  if (detail) {
    const product = PRODUCTS_DB.find((p) => p.code === decodeURIComponent(detail[1]));
    return product ? respond(product) : notFound(req.url);
  }

  return notFound(req.url);
};
