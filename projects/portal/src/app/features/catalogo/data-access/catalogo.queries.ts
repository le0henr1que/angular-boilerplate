import { effect, inject, untracked } from '@angular/core';
import {
  injectQuery,
  keepPreviousData,
  QueryClient,
  queryOptions,
} from '@tanstack/angular-query-experimental';
import { fromEvent, lastValueFrom, takeUntil } from 'rxjs';
import { type FiltrosCatalogo } from '../models/item-catalogo.model';
import { CatalogoService } from './catalogo.service';

/*
 * Cache do catálogo no TanStack Query (mesmo padrão de produtos.queries.ts).
 * O resultado fica no QueryClient global, não no componente: sair e voltar para a tela
 * dentro do staleTime (1 min, em core/query/query-client.ts) mostra o cache sem chamar a API.
 *
 * Cada combinação de filtros + página é uma entrada própria no cache: voltar para a página 2
 * ou para um filtro já usado aparece na hora.
 */

export const catalogoKeys = {
  todos: ['catalogo'] as const,
  listas: () => [...catalogoKeys.todos, 'lista'] as const,
  lista: (filtros: FiltrosCatalogo) => [...catalogoKeys.listas(), filtros] as const,
};

export const catalogoQueries = {
  lista: (service: CatalogoService, filtros: FiltrosCatalogo) =>
    queryOptions({
      queryKey: catalogoKeys.lista(filtros),
      // O TanStack espera uma Promise; o service devolve Observable.
      // `signal`: se o filtro mudar antes da resposta, a requisição antiga é cancelada
      // (o HttpClient aborta o fetch) em vez de ocupar a rede à toa.
      queryFn: ({ signal }) =>
        lastValueFrom(service.listar(filtros).pipe(takeUntil(fromEvent(signal, 'abort')))),
    }),
};

/**
 * Hook da listagem paginada. Recebe os filtros como função (signal): quando mudam,
 * a query troca de chave sozinha.
 */
export function injectCatalogo(filtros: () => FiltrosCatalogo) {
  const service = inject(CatalogoService);
  const queryClient = inject(QueryClient);

  const query = injectQuery(() => ({
    ...catalogoQueries.lista(service, filtros()),
    // Enquanto a nova página/filtro carrega, a tabela anterior continua na tela
    // (em vez de piscar o esqueleto). Igual ao placeholderData do React.
    placeholderData: keepPreviousData,
  }));

  // Pré-carrega a PRÓXIMA página assim que a atual chega: clicar em "Próxima" abre na hora.
  effect(() => {
    const pagina = query.data();
    if (!pagina || query.isPlaceholderData()) return;
    const atual = filtros();
    if (atual.pagina >= pagina.totalPaginas) return;
    untracked(() =>
      queryClient.prefetchQuery(
        catalogoQueries.lista(service, { ...atual, pagina: atual.pagina + 1 }),
      ),
    );
  });

  return query;
}
