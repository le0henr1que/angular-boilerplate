import { type FieldValues, type ListTableRequest, type ListTableResult } from '@shared/list-table';
import { type RegistrationStatus } from './registration.enums';
import { type REGISTRATION_FILTERS } from './registration.filters';

/** Fields every registration record has (supplier, category). */
export interface RegistrationRecord {
  id: number;
  name: string;
  status: RegistrationStatus;
  /** ISO date and time, UTC (yyyy-mm-ddThh:mm:ssZ). */
  updatedAt: string;
  /** Name of who made the last change. */
  updatedBy: string;
}

/** A supermarket supplier, as GET {apiUrl}/fornecedores returns it. */
export interface Supplier extends RegistrationRecord {
  /** CNPJ, already formatted (00.000.000/0000-00). */
  document: string;
  /** Main category supplied. */
  category: { id: number; name: string };
  location: { city: string; state: string };
}

/** A product category, as GET {apiUrl}/categorias returns it. */
export interface Category extends RegistrationRecord {
  productCount: number;
  supplierCount: number;
}

/** Paginated response: only the requested page, plus the totals. */
export interface RegistrationResponse<T> extends ListTableResult<T> {
  items: T[];
  page: number;
  pageSize: number;
}

export type SupplierResponse = RegistrationResponse<Supplier>;
export type CategoryResponse = RegistrationResponse<Category>;

export type RegistrationFilters = FieldValues<typeof REGISTRATION_FILTERS>;

/** What the screens ask the API for. Also the cache key (see registration.queries.ts). */
export type RegistrationRequest = ListTableRequest<RegistrationFilters>;
