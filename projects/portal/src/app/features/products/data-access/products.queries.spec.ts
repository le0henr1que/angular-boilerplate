import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { TEST_PRODUCTS } from '@testing/products.fixture';
import { provideTestQueryClient } from '@testing/test-query-client';
import { EMPTY_FILTERS } from '../models/product.constants';
import { type ProductFilters } from '../models/product.types';
import { ProductsApi } from './products.api';
import {
  injectProduct,
  injectProductPrefetch,
  injectProducts,
  productKeys,
} from './products.queries';

describe('products.queries (TanStack Query)', () => {
  const api = { list: vi.fn(), get: vi.fn() };

  beforeEach(() => {
    api.list.mockReset().mockResolvedValue(TEST_PRODUCTS);
    api.get.mockReset().mockImplementation(async (code: string) => {
      const product = TEST_PRODUCTS.find((p) => p.code === code);
      if (!product) throw new Error('404');
      return product;
    });
    TestBed.configureTestingModule({
      providers: [provideTestQueryClient(), { provide: ProductsApi, useValue: api }],
    });
  });

  /** Runs the hook in the TestBed injection context, as a component would. */
  const use = <T>(hook: () => T) => runInInjectionContext(TestBed.inject(Injector), hook);

  describe('productKeys', () => {
    it('builds hierarchical keys (they allow invalidating all of "products" at once)', () => {
      expect(productKeys.list(EMPTY_FILTERS)).toEqual(['products', 'list', EMPTY_FILTERS]);
      expect(productKeys.detail('HO-1')).toEqual(['products', 'detail', 'HO-1']);
      expect(productKeys.list(EMPTY_FILTERS).slice(0, 1)).toEqual(productKeys.all);
    });
  });

  describe('injectProducts', () => {
    it('fetches the list and exposes the states as signals', async () => {
      const query = use(() => injectProducts(() => EMPTY_FILTERS));
      expect(query.isPending()).toBe(true);

      await vi.waitFor(() => expect(query.isSuccess()).toBe(true));
      expect(query.data()).toEqual(TEST_PRODUCTS);
      expect(api.list).toHaveBeenCalledWith(EMPTY_FILTERS);
    });

    it('switches keys (and fetches again) when the filters change', async () => {
      const filters = signal<ProductFilters>(EMPTY_FILTERS);
      const query = use(() => injectProducts(filters));
      await vi.waitFor(() => expect(query.isSuccess()).toBe(true));

      api.list.mockResolvedValueOnce([TEST_PRODUCTS[0]]);
      filters.set({ term: 'banana', status: 'all' });
      TestBed.tick();

      // keepPreviousData: until the new response arrives, the old list stays visible.
      expect(query.isPlaceholderData()).toBe(true);
      expect(query.data()).toEqual(TEST_PRODUCTS);

      await vi.waitFor(() => expect(query.isPlaceholderData()).toBe(false));
      expect(query.data()).toEqual([TEST_PRODUCTS[0]]);
      expect(api.list).toHaveBeenLastCalledWith({ term: 'banana', status: 'all' });
    });

    it('reuses the cache: two "components" with the same filters make a single call', async () => {
      const a = use(() => injectProducts(() => EMPTY_FILTERS));
      const b = use(() => injectProducts(() => EMPTY_FILTERS));
      await vi.waitFor(() => expect(a.isSuccess() && b.isSuccess()).toBe(true));
      expect(api.list).toHaveBeenCalledTimes(1);
      expect(b.data()).toBe(a.data());
    });

    it('exposes the error when the API fails', async () => {
      api.list.mockRejectedValueOnce(new Error('down'));
      const query = use(() => injectProducts(() => EMPTY_FILTERS));
      await vi.waitFor(() => expect(query.isError()).toBe(true));
      expect(query.error()?.message).toBe('down');
    });
  });

  describe('injectProduct', () => {
    it('fetches the detail by code', async () => {
      const query = use(() => injectProduct(() => 'BE-2'));
      await vi.waitFor(() => expect(query.isSuccess()).toBe(true));
      expect(query.data()?.name).toBe('Suco de laranja 1 L');
    });
  });

  describe('injectProductPrefetch', () => {
    it('puts the detail in the cache before anyone asks for it', async () => {
      const prefetch = use(() => injectProductPrefetch());
      await prefetch('HO-1');

      const cache = TestBed.inject(QueryClient).getQueryData(productKeys.detail('HO-1'));
      expect(cache).toEqual(TEST_PRODUCTS[0]);

      // Whoever asks later gets it from the cache, with no new call.
      const query = use(() => injectProduct(() => 'HO-1'));
      expect(query.data()).toEqual(TEST_PRODUCTS[0]);
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });
});
