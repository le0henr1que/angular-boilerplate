import { effect, inject, untracked } from '@angular/core';
import {
  injectQuery,
  keepPreviousData,
  QueryClient,
  queryOptions,
} from '@tanstack/angular-query-experimental';
import { fromEvent, isObservable, lastValueFrom, takeUntil } from 'rxjs';
import {
  type ListTableFonte,
  type ListTableRequisicao,
  type ListTableResultado,
} from '../models/list-table.models';

/** Evento do AbortSignal disparado quando o TanStack cancela a consulta. */
const EVENTO_ABORTAR = 'abort';

function opcoesDaConsulta<T, F>(fonte: ListTableFonte<T, F>, requisicao: ListTableRequisicao<F>) {
  return queryOptions({
    queryKey: [...fonte.chave, requisicao],
    // Se a requisição mudar antes da resposta, a antiga é cancelada (o HttpClient aborta).
    queryFn: ({ signal }): Promise<ListTableResultado<T>> => {
      const resposta = fonte.buscar(requisicao);
      if (isObservable(resposta)) {
        return lastValueFrom(resposta.pipe(takeUntil(fromEvent(signal, EVENTO_ABORTAR))));
      }
      return resposta;
    },
  });
}

/**
 * "Hook" da consulta da list-table no TanStack Query:
 *  - cada requisição (filtros + busca + página + ordenação) é uma entrada própria no cache;
 *  - keepPreviousData: enquanto a nova carrega, a anterior continua na tela;
 *  - com paginação, pré-carrega a PRÓXIMA página assim que a atual chega.
 */
export function injectListQuery<T, F>(
  fonte: () => ListTableFonte<T, F>,
  requisicao: () => ListTableRequisicao<F>,
) {
  const queryClient = inject(QueryClient);

  const query = injectQuery(() => ({
    ...opcoesDaConsulta(fonte(), requisicao()),
    placeholderData: keepPreviousData,
  }));

  effect(() => {
    const resultado = query.data();
    const atual = requisicao();
    if (!resultado || query.isPlaceholderData() || !atual.paginacao) return;
    if (atual.paginacao.pagina >= resultado.totalPaginas) return;
    const proxima = {
      ...atual,
      paginacao: { ...atual.paginacao, pagina: atual.paginacao.pagina + 1 },
    };
    untracked(() => queryClient.prefetchQuery(opcoesDaConsulta(fonte(), proxima)));
  });

  return query;
}
