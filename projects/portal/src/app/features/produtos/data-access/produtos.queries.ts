import { inject } from '@angular/core';
import {
  injectQuery,
  keepPreviousData,
  QueryClient,
  queryOptions,
} from '@tanstack/angular-query-experimental';
import { type FiltrosProdutos } from '../models/produto.model';
import { ProdutosApi } from './produtos.api';

/*
 * Mesmo modelo do TanStack Query no React. Comparando:
 *
 *   React                                   Angular (este arquivo)
 *   ─────────────────────────────────────   ─────────────────────────────────────────
 *   function useProdutos(filtros) {         function injectProdutos(filtros) {
 *     return useQuery({ queryKey, ... })      return injectQuery(() => ({ queryKey, ... }))
 *   }                                       }
 *   const { data, isPending } = useProdutos(f)   readonly produtos = injectProdutos(this.filtros)
 *   data / isPending (valores)                    produtos.data() / produtos.isPending() (signals)
 *
 * No Angular os "hooks" se chamam inject*() e funcionam no mesmo lugar onde o React deixa
 * usar hooks: na criação do componente (inicializador de campo ou constructor).
 * A diferença: em vez de rodar de novo a cada render, injectQuery recebe uma FUNÇÃO.
 * Quando um signal lido dentro dela muda (ex.: os filtros), a query troca de chave sozinha.
 */

/** Chaves do cache. Organizadas em fábrica, como recomenda a documentação do TanStack. */
export const produtosKeys = {
  todas: ['produtos'] as const,
  listas: () => [...produtosKeys.todas, 'lista'] as const,
  lista: (filtros: FiltrosProdutos) => [...produtosKeys.listas(), filtros] as const,
  detalhe: (codigo: string) => [...produtosKeys.todas, 'detalhe', codigo] as const,
};

/**
 * queryOptions reúne chave + função num só lugar, para serem usadas tanto no hook
 * quanto em chamadas diretas ao cache (prefetch, invalidate…).
 */
export const produtosQueries = {
  lista: (api: ProdutosApi, filtros: FiltrosProdutos) =>
    queryOptions({
      queryKey: produtosKeys.lista(filtros),
      queryFn: () => api.listar(filtros),
    }),
  detalhe: (api: ProdutosApi, codigo: string) =>
    queryOptions({
      queryKey: produtosKeys.detalhe(codigo),
      queryFn: () => api.buscar(codigo),
    }),
};

/** Hook da listagem. Cada combinação de filtros tem seu próprio cache. */
export function injectProdutos(filtros: () => FiltrosProdutos) {
  const api = inject(ProdutosApi);
  return injectQuery(() => ({
    ...produtosQueries.lista(api, filtros()),
    // Ao trocar de filtro, mantém a tabela anterior na tela até a nova resposta chegar
    // (em vez de piscar o "carregando"). Igual ao placeholderData do React.
    placeholderData: keepPreviousData,
  }));
}

/** Hook do detalhe de um produto. */
export function injectProduto(codigo: () => string) {
  const api = inject(ProdutosApi);
  return injectQuery(() => produtosQueries.detalhe(api, codigo()));
}

/**
 * Hook que devolve uma função para pré-carregar o detalhe (ex.: ao passar o mouse na linha).
 * Quando o usuário clicar, os dados já estão no cache e a página abre na hora.
 */
export function injectPrefetchProduto() {
  const api = inject(ProdutosApi);
  const queryClient = inject(QueryClient);
  return (codigo: string) => queryClient.prefetchQuery(produtosQueries.detalhe(api, codigo));
}
