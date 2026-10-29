import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiUrlInterceptor } from '@core/http/api-url.interceptor';
import { TEST_PRODUCTS } from '@testing/products.fixture';
import { provideTestAppConfig } from '@testing/test-config';
import { EMPTY_FILTERS } from '../models/product.constants';
import { ProductsApi } from './products.api';

describe('ProductsApi', () => {
  let api: ProductsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({ apiUrl: 'https://api.exemplo.com' }),
        // Same as the app: the base URL comes from the interceptor, not from the service.
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(ProductsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists without parameters when there are no filters', async () => {
    const response = api.list(EMPTY_FILTERS);
    const req = http.expectOne('https://api.exemplo.com/produtos');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual([]);
    req.flush(TEST_PRODUCTS);
    expect(await response).toEqual(TEST_PRODUCTS);
  });

  it('sends term and status as query params', async () => {
    const response = api.list({ term: 'banana', status: 'available' });
    const req = http.expectOne((r) => r.url === 'https://api.exemplo.com/produtos');
    expect(req.request.params.get('q')).toBe('banana');
    expect(req.request.params.get('status')).toBe('available');
    req.flush([]);
    await response;
  });

  it('does not send status when it is "all"', async () => {
    const response = api.list({ term: '', status: 'all' });
    const req = http.expectOne((r) => r.url.endsWith('/produtos'));
    expect(req.request.params.has('status')).toBe(false);
    req.flush([]);
    await response;
  });

  it('gets the detail encoding the code in the URL', async () => {
    const response = api.get('HO 1/2');
    http.expectOne('https://api.exemplo.com/produtos/HO%201%2F2').flush(TEST_PRODUCTS[0]);
    expect(await response).toEqual(TEST_PRODUCTS[0]);
  });

  it('rejects the Promise when the API fails', async () => {
    const response = api.get('X');
    http.expectOne(() => true).flush('error', { status: 500, statusText: 'Server Error' });
    await expect(response).rejects.toMatchObject({ status: 500 });
  });
});
