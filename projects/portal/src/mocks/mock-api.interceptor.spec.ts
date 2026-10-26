import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { type Produto } from '@features/produtos';
import { provideTestAppConfig } from '@testing/test-config';
import { firstValueFrom } from 'rxjs';
import { CATALOGO_DB } from './catalogo.db';
import { PRODUTOS_DB } from './produtos.db';
import { mockApiInterceptor } from './mock-api.interceptor';

describe('mockApiInterceptor (API simulada)', () => {
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

  /** Dispara o GET e avança o relógio falso além da latência simulada (800 ms). */
  async function get<T>(url: string, params: Record<string, string> = {}): Promise<T> {
    const resposta = firstValueFrom(http.get<T>(url, { params }));
    await vi.advanceTimersByTimeAsync(1000);
    return resposta;
  }

  it('lista todos os produtos sem filtros', async () => {
    const lista = await get<Produto[]>('/api/produtos');
    expect(lista).toHaveLength(PRODUTOS_DB.length);
  });

  it('filtra pelo termo ignorando acentos e maiúsculas', async () => {
    const lista = await get<Produto[]>('/api/produtos', { q: 'MACA' });
    expect(lista.map((p) => p.nome)).toEqual(['Maçã gala (kg)']);
  });

  it('filtra também por código e categoria', async () => {
    const [primeiro] = PRODUTOS_DB;
    expect(await get<Produto[]>('/api/produtos', { q: primeiro.codigo })).toEqual([primeiro]);

    const bebidas = await get<Produto[]>('/api/produtos', { q: 'bebidas' });
    expect(bebidas.length).toBeGreaterThan(0);
    expect(bebidas.every((p) => p.categoria === 'Bebidas')).toBe(true);
  });

  it('filtra por status e ignora status inválido', async () => {
    const disponiveis = await get<Produto[]>('/api/produtos', { status: 'disponivel' });
    expect(disponiveis.length).toBeGreaterThan(0);
    expect(disponiveis.every((p) => p.status === 'disponivel')).toBe(true);

    const invalido = await get<Produto[]>('/api/produtos', { status: 'xyz' });
    expect(invalido).toHaveLength(PRODUTOS_DB.length);
  });

  it('busca o detalhe pelo código', async () => {
    const alvo = PRODUTOS_DB[3];
    expect(await get<Produto>(`/api/produtos/${alvo.codigo}`)).toEqual(alvo);
  });

  it('lista o catálogo', async () => {
    expect(await get('/api/catalogo')).toEqual(CATALOGO_DB);
  });

  it('responde 404 para produto inexistente', async () => {
    const resposta = firstValueFrom(http.get('/api/produtos/NAO-EXISTE'));
    const verificacao = expect(resposta).rejects.toSatisfy(
      (erro: unknown) => erro instanceof HttpErrorResponse && erro.status === 404,
    );
    await vi.advanceTimersByTimeAsync(1000);
    await verificacao;
  });

  it('deixa passar o que não é /api (vai para o próximo handler)', () => {
    const controle = TestBed.inject(HttpTestingController);
    http.get('/assets/config.json').subscribe();
    controle.expectOne('/assets/config.json').flush({});
    controle.verify();
  });

  it('respeita o apiUrl configurado', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({ apiUrl: '/backend/v1' }),
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    const controle = TestBed.inject(HttpTestingController);

    expect(await get<Produto[]>('/backend/v1/produtos')).toHaveLength(PRODUTOS_DB.length);
    // Com outro apiUrl, /api deixa de ser interceptado.
    http.get('/api/produtos').subscribe();
    controle.expectOne('/api/produtos');
  });
});
