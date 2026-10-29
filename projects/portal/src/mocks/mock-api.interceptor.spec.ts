import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { type CatalogResponse } from '@features/catalog';
import { type EcosystemResponse } from '@features/ecosystem';
import { type Product } from '@features/products';
import { provideTestAppConfig } from '@testing/test-config';
import { firstValueFrom } from 'rxjs';
import { CATALOG_DB } from './catalog.db';
import { ECOSYSTEM_DB } from './ecosystem.db';
import { mockApiInterceptor } from './mock-api.interceptor';
import { PRODUCTS_DB } from './products.db';

describe('mockApiInterceptor (mock API)', () => {
  let http: HttpClient;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({ apiUrl: '/api' }),
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /** Fires the GET and moves the fake clock past the simulated latency (800 ms). */
  async function get<T>(url: string, params: Record<string, string> = {}): Promise<T> {
    const response = firstValueFrom(http.get<T>(url, { params }));
    await vi.advanceTimersByTimeAsync(1000);
    return response;
  }

  it('lists every product without filters', async () => {
    const list = await get<Product[]>('/api/produtos');
    expect(list).toHaveLength(PRODUCTS_DB.length);
  });

  it('filters by term ignoring accents and case', async () => {
    const list = await get<Product[]>('/api/produtos', { q: 'MACA' });
    expect(list.map((p) => p.name)).toEqual(['Maçã gala (kg)']);
  });

  it('also filters by code and category', async () => {
    const [first] = PRODUCTS_DB;
    expect(await get<Product[]>('/api/produtos', { q: first.code })).toEqual([first]);

    const drinks = await get<Product[]>('/api/produtos', { q: 'bebidas' });
    expect(drinks.length).toBeGreaterThan(0);
    expect(drinks.every((p) => p.category === 'Bebidas')).toBe(true);
  });

  it('filters by status and ignores an invalid status', async () => {
    const available = await get<Product[]>('/api/produtos', { status: 'available' });
    expect(available.length).toBeGreaterThan(0);
    expect(available.every((p) => p.status === 'available')).toBe(true);

    const invalid = await get<Product[]>('/api/produtos', { status: 'xyz' });
    expect(invalid).toHaveLength(PRODUCTS_DB.length);
  });

  it('gets the detail by code', async () => {
    const target = PRODUCTS_DB[3];
    expect(await get<Product>(`/api/produtos/${target.code}`)).toEqual(target);
  });

  it('paginates the catalog on the server', async () => {
    const page2 = await get<CatalogResponse>('/api/catalogo', { pagina: '2', porPagina: '10' });
    expect(page2.items).toEqual(CATALOG_DB.slice(10, 20));
    expect(page2).toMatchObject({
      total: CATALOG_DB.length,
      page: 2,
      pageSize: 10,
      totalPages: Math.ceil(CATALOG_DB.length / 10),
    });
  });

  it('filters the catalog by term, category and low stock', async () => {
    const response = await get<CatalogResponse>('/api/catalogo', {
      q: 'cafe', // without accent, finds "Café"
      categoria: 'Bebidas',
      porPagina: '100',
    });
    expect(response.items.length).toBeGreaterThan(0);
    expect(
      response.items.every((i) => i.name.includes('Café') && i.category.name === 'Bebidas'),
    ).toBe(true);

    const low = await get<CatalogResponse>('/api/catalogo', {
      estoqueBaixo: 'true',
      porPagina: '100',
    });
    expect(low.total).toBeGreaterThan(0);
    expect(low.items.every((i) => i.stock.quantity <= i.stock.minimum)).toBe(true);
  });

  it('sorts the catalog on the server, nested fields included', async () => {
    const byPrice = await get<CatalogResponse>('/api/catalogo', {
      ordenarPor: 'price',
      direcao: 'desc',
      porPagina: '100',
    });
    const prices = byPrice.items.map((i) => i.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));

    const byStock = await get<CatalogResponse>('/api/catalogo', {
      ordenarPor: 'stock.quantity',
      porPagina: '100',
    });
    const stock = byStock.items.map((i) => i.stock.quantity);
    expect(stock).toEqual([...stock].sort((a, b) => a - b));
  });

  it('clamps an out-of-range page to the last one', async () => {
    const response = await get<CatalogResponse>('/api/catalogo', { pagina: '999' });
    expect(response.page).toBe(response.totalPages);
  });

  it('filters, sorts and paginates the ecosystem on the server', async () => {
    const logistics = await get<EcosystemResponse>('/api/ecossistema', {
      tipo: 'logistics',
      ativos: 'true',
      ordenarPor: 'name',
      direcao: 'asc',
      porPagina: '100',
    });
    expect(logistics.total).toBeGreaterThan(0);
    expect(logistics.total).toBeLessThan(ECOSYSTEM_DB.length);
    expect(logistics.items.every((p) => p.type === 'logistics' && p.active)).toBe(true);
    const names = logistics.items.map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pt-BR')));

    const page2 = await get<EcosystemResponse>('/api/ecossistema', {
      pagina: '2',
      porPagina: '10',
    });
    expect(page2).toMatchObject({ page: 2, pageSize: 10, total: ECOSYSTEM_DB.length });
    expect(page2.items).toEqual(ECOSYSTEM_DB.slice(10, 20));
  });

  it('answers 404 for a product that does not exist', async () => {
    const response = firstValueFrom(http.get('/api/produtos/NAO-EXISTE'));
    const check = expect(response).rejects.toSatisfy(
      (error: unknown) => error instanceof HttpErrorResponse && error.status === 404,
    );
    await vi.advanceTimersByTimeAsync(1000);
    await check;
  });

  it('lets through what is not /api (goes to the next handler)', () => {
    const controller = TestBed.inject(HttpTestingController);
    http.get('/assets/config.json').subscribe();
    controller.expectOne('/assets/config.json').flush({});
    controller.verify();
  });

  it('honors the configured apiUrl', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({ apiUrl: '/backend/v1' }),
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    expect(await get<Product[]>('/backend/v1/produtos')).toHaveLength(PRODUCTS_DB.length);
    // With another apiUrl, /api is no longer intercepted.
    http.get('/api/produtos').subscribe();
    controller.expectOne('/api/produtos');
  });
});
