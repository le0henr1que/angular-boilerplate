import { type Product } from '@features/products';

/** Small fixed data for the tests (independent from the mock API). */
export const TEST_PRODUCTS: Product[] = [
  {
    code: 'HO-1',
    name: 'Banana prata (kg)',
    category: 'Hortifruti',
    manufacturedAt: '2026-01-01',
    expiresAt: '2026-01-08',
    price: 7.99,
    status: 'available',
    supplier: 'Hortifruti Vale Verde',
    store: 'Loja Centro',
  },
  {
    code: 'BE-2',
    name: 'Suco de laranja 1 L',
    category: 'Bebidas',
    manufacturedAt: '2026-02-10',
    expiresAt: '2026-08-09',
    price: 9.8,
    status: 'low',
    supplier: 'Distribuidora Bom Preço',
    store: 'Loja Norte',
  },
  {
    code: 'PA-3',
    name: 'Pão de forma integral',
    category: 'Padaria',
    manufacturedAt: '2026-03-15',
    expiresAt: '2026-03-20',
    price: 12.5,
    status: 'out-of-stock',
    supplier: 'Distribuidora Bom Preço',
    store: 'Loja Sul',
  },
];
