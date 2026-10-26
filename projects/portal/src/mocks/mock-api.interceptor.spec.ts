import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { type PaginaCatalogo } from '@features/catalogo';
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

  it('pagina o catálogo no servidor', async () => {
    const pagina2 = await get<PaginaCatalogo>('/api/catalogo', { pagina: '2', porPagina: '10' });
    expect(pagina2.itens).toEqual(CATALOGO_DB.slice(10, 20));
    expect(pagina2).toMatchObject({
      total: CATALOGO_DB.length,
      pagina: 2,
      porPagina: 10,
      totalPaginas: Math.ceil(CATALOGO_DB.length / 10),
    });
  });

  it('filtra o catálogo por termo, categoria e estoque baixo', async () => {
    const resposta = await get<PaginaCatalogo>('/api/catalogo', {
      q: 'cafe', // sem acento, acha "Café"
      categoria: 'Bebidas',
      porPagina: '100',
    });
    expect(resposta.itens.length).toBeGreaterThan(0);
    expect(
      resposta.itens.every((i) => i.nome.includes('Café') && i.categoria.nome === 'Bebidas'),
    ).toBe(true);

    const baixo = await get<PaginaCatalogo>('/api/catalogo', {
      estoqueBaixo: 'true',
      porPagina: '100',
    });
    expect(baixo.total).toBeGreaterThan(0);
    expect(baixo.itens.every((i) => i.estoque.quantidade <= i.estoque.minimo)).toBe(true);
  });

  it('corrige página fora do intervalo para a última', async () => {
    const resposta = await get<PaginaCatalogo>('/api/catalogo', { pagina: '999' });
    expect(resposta.pagina).toBe(resposta.totalPaginas);
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
