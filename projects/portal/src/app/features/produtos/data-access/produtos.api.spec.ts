import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PRODUTOS_TESTE } from '@testing/produtos.fixture';
import { provideTestAppConfig } from '@testing/test-config';
import { FILTROS_VAZIOS } from '../models/produto.model';
import { ProdutosApi } from './produtos.api';

describe('ProdutosApi', () => {
  let api: ProdutosApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({ apiUrl: 'https://api.exemplo.com' }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(ProdutosApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista sem parâmetros quando não há filtros', async () => {
    const resposta = api.listar(FILTROS_VAZIOS);
    const req = http.expectOne('https://api.exemplo.com/produtos');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual([]);
    req.flush(PRODUTOS_TESTE);
    expect(await resposta).toEqual(PRODUTOS_TESTE);
  });

  it('envia termo e status como query params', async () => {
    const resposta = api.listar({ termo: 'banana', status: 'disponivel' });
    const req = http.expectOne((r) => r.url === 'https://api.exemplo.com/produtos');
    expect(req.request.params.get('q')).toBe('banana');
    expect(req.request.params.get('status')).toBe('disponivel');
    req.flush([]);
    await resposta;
  });

  it('não envia status quando é "todos"', async () => {
    const resposta = api.listar({ termo: '', status: 'todos' });
    const req = http.expectOne((r) => r.url.endsWith('/produtos'));
    expect(req.request.params.has('status')).toBe(false);
    req.flush([]);
    await resposta;
  });

  it('busca o detalhe codificando o código na URL', async () => {
    const resposta = api.buscar('HO 1/2');
    http.expectOne('https://api.exemplo.com/produtos/HO%201%2F2').flush(PRODUTOS_TESTE[0]);
    expect(await resposta).toEqual(PRODUTOS_TESTE[0]);
  });

  it('rejeita a Promise quando a API falha', async () => {
    const resposta = api.buscar('X');
    http.expectOne(() => true).flush('erro', { status: 500, statusText: 'Server Error' });
    await expect(resposta).rejects.toMatchObject({ status: 500 });
  });
});
