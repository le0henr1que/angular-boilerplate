import { inject } from '@angular/core';
import { type ListTableFonte } from '@shared/list-table';
import { type FiltrosCatalogo, type ItemCatalogo } from '../models/item-catalogo.model';
import { CatalogoService } from './catalogo.service';

/*
 * Cache do catálogo no TanStack Query (mesmo padrão de produtos.queries.ts).
 * A list-table guarda o resultado no QueryClient global com a chave
 * [...catalogoKeys.listas(), requisição]: cada combinação de busca + filtros + página +
 * ordenação é uma entrada própria, e sair e voltar para a tela dentro do staleTime
 * (core/query/query-client.ts) mostra o cache sem chamar a API.
 */

export const catalogoKeys = {
  todos: ['catalogo'] as const,
  listas: () => [...catalogoKeys.todos, 'lista'] as const,
};

/** De onde a list-table do catálogo tira os dados. Só pode ser chamado na criação do componente. */
export function injectFonteCatalogo(): ListTableFonte<ItemCatalogo, FiltrosCatalogo> {
  const service = inject(CatalogoService);
  return {
    chave: catalogoKeys.listas(),
    buscar: (requisicao) => service.listar(requisicao),
  };
}
