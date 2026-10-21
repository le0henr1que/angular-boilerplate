import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FILTROS_VAZIOS,
  type FiltrosProdutos,
  STATUS_PRODUTO,
  type StatusProduto,
} from '../models/produto.model';

/**
 * "Hook" de filtros da listagem — o equivalente a um useFiltrosProdutos() no React.
 *
 * O estado mora na URL (?q=banana&status=disponivel), como faria um useSearchParams:
 *  - recarregar a página ou compartilhar o link mantém a pesquisa;
 *  - o botão "voltar" do navegador desfaz o último filtro.
 *
 * Como todo inject*(), só pode ser chamado na criação do componente.
 */
export function injectFiltrosProdutos() {
  const router = inject(Router);
  const route = inject(ActivatedRoute);
  const params = toSignal(route.queryParamMap, { requireSync: true });

  const filtros = computed<FiltrosProdutos>(() => {
    const status = params().get('status');
    return {
      termo: params().get('q') ?? '',
      // Ignora valores inválidos digitados na URL (ex.: ?status=xyz).
      status: STATUS_PRODUTO.includes(status as StatusProduto)
        ? (status as StatusProduto)
        : 'todos',
    };
  });

  function atualizar(mudancas: Partial<FiltrosProdutos>) {
    const proximo = { ...filtros(), ...mudancas };
    router.navigate([], {
      relativeTo: route,
      // null remove o parâmetro da URL, para ela ficar limpa quando não há filtro.
      queryParams: {
        q: proximo.termo.trim() || null,
        status: proximo.status === 'todos' ? null : proximo.status,
      },
    });
  }

  return {
    /** Filtros aplicados (signal). Use como dependência da query. */
    filtros,
    temFiltro: computed(
      () => filtros().termo !== FILTROS_VAZIOS.termo || filtros().status !== FILTROS_VAZIOS.status,
    ),
    pesquisar: (termo: string) => atualizar({ termo }),
    filtrarPorStatus: (status: FiltrosProdutos['status']) => atualizar({ status }),
    limpar: () => atualizar(FILTROS_VAZIOS),
  };
}
