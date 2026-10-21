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
import { interceptorSobDemanda } from './interceptor-sob-demanda';

const HEADER = new InjectionToken<string>('HEADER');

/** Como os mocks: usa inject() — que só funciona se o contexto de injeção for mantido. */
const interceptorReal: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { 'X-Teste': inject(HEADER) } }));

describe('interceptorSobDemanda', () => {
  const carregar = vi.fn(() => Promise.resolve(interceptorReal));

  beforeEach(() => {
    carregar.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: HEADER, useValue: 'carregado' },
        provideHttpClient(withInterceptors([interceptorSobDemanda(carregar)])),
        provideHttpClientTesting(),
      ],
    });
  });

  it('carrega o interceptor e roda com inject() funcionando depois do import()', async () => {
    const http = TestBed.inject(HttpClient);
    const backend = TestBed.inject(HttpTestingController);

    const resposta = firstValueFrom(http.get('/api/x'));
    const req = await vi.waitFor(() => backend.expectOne('/api/x'));
    expect(req.request.headers.get('X-Teste')).toBe('carregado');
    req.flush({ ok: true });
    expect(await resposta).toEqual({ ok: true });
  });

  it('baixa o código uma vez só, mesmo com várias requisições', async () => {
    const http = TestBed.inject(HttpClient);
    const backend = TestBed.inject(HttpTestingController);

    http.get('/api/a').subscribe();
    http.get('/api/b').subscribe();
    await vi.waitFor(() => backend.expectOne('/api/a'));
    await vi.waitFor(() => backend.expectOne('/api/b'));
    expect(carregar).toHaveBeenCalledTimes(1);
  });
});
