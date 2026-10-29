import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideTestAppConfig } from '@testing/test-config';
import { apiUrlInterceptor } from './api-url.interceptor';

describe('apiUrlInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({ apiUrl: 'https://api.exemplo.com/v1' }),
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('prefixes the apiUrl to resource paths', () => {
    http.get('produtos/HO-1').subscribe();
    backend.expectOne('https://api.exemplo.com/v1/produtos/HO-1').flush({});
  });

  it('keeps absolute URLs and app-relative paths unchanged', () => {
    http.get('https://viacep.com.br/ws/01001000/json/').subscribe();
    http.get('/assets/config.json').subscribe();
    backend.expectOne('https://viacep.com.br/ws/01001000/json/').flush({});
    backend.expectOne('/assets/config.json').flush({});
  });
});
