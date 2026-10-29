import {
  HttpClient,
  type HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { inject, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { lazyInterceptor } from './lazy-interceptor';

const HEADER = new InjectionToken<string>('HEADER');

/** Like the mocks: uses inject() — which only works if the injection context is kept. */
const realInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { 'X-Test': inject(HEADER) } }));

describe('lazyInterceptor', () => {
  const load = vi.fn(() => Promise.resolve(realInterceptor));

  beforeEach(() => {
    load.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: HEADER, useValue: 'loaded' },
        provideHttpClient(withInterceptors([lazyInterceptor(load)])),
        provideHttpClientTesting(),
      ],
    });
  });

  it('loads the interceptor and runs it with inject() working after the import()', async () => {
    const http = TestBed.inject(HttpClient);
    const backend = TestBed.inject(HttpTestingController);

    const response = firstValueFrom(http.get('/api/x'));
    const req = await vi.waitFor(() => backend.expectOne('/api/x'));
    expect(req.request.headers.get('X-Test')).toBe('loaded');
    req.flush({ ok: true });
    expect(await response).toEqual({ ok: true });
  });

  it('downloads the code only once, even with several requests', async () => {
    const http = TestBed.inject(HttpClient);
    const backend = TestBed.inject(HttpTestingController);

    http.get('/api/a').subscribe();
    http.get('/api/b').subscribe();
    await vi.waitFor(() => backend.expectOne('/api/a'));
    await vi.waitFor(() => backend.expectOne('/api/b'));
    expect(load).toHaveBeenCalledTimes(1);
  });
});
