import { inject } from '@angular/core';
import { type ListTableSource } from '@shared/list-table';
import {
  type Category,
  type RegistrationFilters,
  type Supplier,
} from '../models/registration.types';
import { RegistrationService } from './registration.service';

/** Cache keys (TanStack Query). The list-table appends the full request to `lists()`. */
export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
};

/** Where the suppliers list-table gets its data. Can only be called at component creation. */
export function injectSupplierSource(): ListTableSource<Supplier, RegistrationFilters> {
  const service = inject(RegistrationService);
  return {
    key: supplierKeys.lists(),
    // The API response already has the list-table shape ({ items, total, totalPages }).
    fetch: (request) => service.listSuppliers(request),
  };
}

/** Where the categories list-table gets its data. Can only be called at component creation. */
export function injectCategorySource(): ListTableSource<Category, RegistrationFilters> {
  const service = inject(RegistrationService);
  return {
    key: categoryKeys.lists(),
    fetch: (request) => service.listCategories(request),
  };
}
