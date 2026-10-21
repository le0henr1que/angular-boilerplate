import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { PRODUTOS_TESTE } from '@testing/produtos.fixture';
import { provideTestQueryClient } from '@testing/test-query-client';
import { FILTROS_VAZIOS, type FiltrosProdutos } from '../models/produto.model';
import { ProdutosApi } from './produtos.api';
import {
  produtosKeys,
  injectProduto,
  injectProdutos,
  injectPrefetchProduto,
} from './produtos.queries';

describe('produtos.queries (TanStack Query)', () => {
  const api = { listar: vi.fn(), buscar: vi.fn() };

  beforeEach(() => {
    api.listar.mockReset().mockResolvedValue(PRODUTOS_TESTE);
    api.buscar.mockReset().mockImplementation(async (codigo: string) => {
      const produto = PRODUTOS_TESTE.find((a) => a.codigo === codigo);
      if (!produto) throw new Error('404');
      return produto;
    });
    TestBed.configureTestingModule({
      providers: [provideTestQueryClient(), { provide: ProdutosApi, useValue: api }],
    });
  });

  /** Executa o hook no contexto de injeção do TestBed, como faria um componente. */
  const usar = <T>(hook: () => T) => runInInjectionContext(TestBed.inject(Injector), hook);

  describe('produtosKeys', () => {
    it('gera chaves hierárquicas (permitem invalidar tudo de "produtos" de uma vez)', () => {
      expect(produtosKeys.lista(FILTROS_VAZIOS)).toEqual(['produtos', 'lista', FILTROS_VAZIOS]);
      expect(produtosKeys.detalhe('HO-1')).toEqual(['produtos', 'detalhe', 'HO-1']);
      expect(produtosKeys.lista(FILTROS_VAZIOS).slice(0, 1)).toEqual(produtosKeys.todas);
    });
  });

  describe('injectProdutos', () => {
    it('busca a lista e expõe os estados como signals', async () => {
      const query = usar(() => injectProdutos(() => FILTROS_VAZIOS));
      expect(query.isPending()).toBe(true);

      await vi.waitFor(() => expect(query.isSuccess()).toBe(true));
      expect(query.data()).toEqual(PRODUTOS_TESTE);
      expect(api.listar).toHaveBeenCalledWith(FILTROS_VAZIOS);
    });

    it('troca de chave (e busca de novo) quando os filtros mudam', async () => {
      const filtros = signal<FiltrosProdutos>(FILTROS_VAZIOS);
      const query = usar(() => injectProdutos(filtros));
      await vi.waitFor(() => expect(query.isSuccess()).toBe(true));

      api.listar.mockResolvedValueOnce([PRODUTOS_TESTE[0]]);
      filtros.set({ termo: 'banana', status: 'todos' });
      TestBed.tick();

      // keepPreviousData: enquanto a nova busca não chega, a lista antiga continua visível.
      expect(query.isPlaceholderData()).toBe(true);
      expect(query.data()).toEqual(PRODUTOS_TESTE);

      await vi.waitFor(() => expect(query.isPlaceholderData()).toBe(false));
      expect(query.data()).toEqual([PRODUTOS_TESTE[0]]);
      expect(api.listar).toHaveBeenLastCalledWith({ termo: 'banana', status: 'todos' });
    });

    it('reaproveita o cache: dois "componentes" com os mesmos filtros fazem uma chamada só', async () => {
      const a = usar(() => injectProdutos(() => FILTROS_VAZIOS));
      const b = usar(() => injectProdutos(() => FILTROS_VAZIOS));
      await vi.waitFor(() => expect(a.isSuccess() && b.isSuccess()).toBe(true));
      expect(api.listar).toHaveBeenCalledTimes(1);
      expect(b.data()).toBe(a.data());
    });

    it('expõe o erro quando a API falha', async () => {
      api.listar.mockRejectedValueOnce(new Error('fora do ar'));
      const query = usar(() => injectProdutos(() => FILTROS_VAZIOS));
      await vi.waitFor(() => expect(query.isError()).toBe(true));
      expect(query.error()?.message).toBe('fora do ar');
    });
  });

  describe('injectProduto', () => {
    it('busca o detalhe pelo código', async () => {
      const query = usar(() => injectProduto(() => 'BE-2'));
      await vi.waitFor(() => expect(query.isSuccess()).toBe(true));
      expect(query.data()?.nome).toBe('Suco de laranja 1 L');
    });
  });

  describe('injectPrefetchProduto', () => {
    it('coloca o detalhe no cache antes de alguém pedir', async () => {
      const prefetch = usar(() => injectPrefetchProduto());
      await prefetch('HO-1');

      const cache = TestBed.inject(QueryClient).getQueryData(produtosKeys.detalhe('HO-1'));
      expect(cache).toEqual(PRODUTOS_TESTE[0]);

      // Quem pedir depois recebe do cache, sem nova chamada.
      const query = usar(() => injectProduto(() => 'HO-1'));
      expect(query.data()).toEqual(PRODUTOS_TESTE[0]);
      expect(api.buscar).toHaveBeenCalledTimes(1);
    });
  });
});
