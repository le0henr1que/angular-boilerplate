import { type ProductStatus, type StatusFilter } from './product.enums';

export type Category = 'Hortifruti' | 'Padaria' | 'Bebidas' | 'Limpeza';

export interface Product {
  code: string;
  name: string;
  category: Category;
  manufacturedAt: string; // ISO (yyyy-mm-dd), as a real API would send it
  expiresAt: string;
  price: number;
  status: ProductStatus;
  supplier: string;
  store: string;
}

/** Listing filters. They are also part of the cache key (see products.queries.ts). */
export interface ProductFilters {
  term: string;
  status: StatusFilter;
}
