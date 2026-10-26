import { inject } from '@angular/core';
import { injectQuery, queryOptions } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { CatalogoService } from './catalogo.service';

/*
 * Cache do catálogo no TanStack Query (mesmo padrão de produtos.queries.ts).
 * O resultado fica no QueryClient global, não no componente: sair e voltar para a tela
 * dentro do staleTime (1 min, em core/query/query-client.ts) mostra o cache sem chamar a API.
 */

export const catalogoKeys = {
  todos: ['catalogo'] as const,
  lista: () => [...catalogoKeys.todos, 'lista'] as const,
};

export const catalogoQueries = {
  lista: (service: CatalogoService) =>
    queryOptions({
      queryKey: catalogoKeys.lista(),
      // O TanStack espera uma Promise; o service devolve Observable.
      queryFn: () => lastValueFrom(service.listar()),
    }),
};

/** Hook da listagem do catálogo. */
export function injectCatalogo() {
  const service = inject(CatalogoService);
  return injectQuery(() => catalogoQueries.lista(service));
}
