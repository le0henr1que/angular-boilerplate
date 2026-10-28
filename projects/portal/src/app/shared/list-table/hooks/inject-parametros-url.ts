import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Params, type QueryParamsHandling, Router } from '@angular/router';
import { type OpcoesDeAplicacao } from '../list-table.context';

/** Só os parâmetros enviados mudam; os outros da URL (de outras partes da tela) ficam. */
const MESCLAR_COM_A_URL: QueryParamsHandling = 'merge';

/**
 * Leitura e escrita da query string da rota atual. É a única peça que fala com o Router:
 * os outros hooks só montam os parâmetros, e quem os compõe grava tudo numa navegação só.
 */
export function injectParametrosUrl() {
  const router = inject(Router);
  const route = inject(ActivatedRoute);
  const params = toSignal(route.queryParamMap, { requireSync: true });

  return {
    /** Lê um parâmetro (reativo: dentro de computed, recalcula quando a URL muda). */
    ler: (param: string): string | null => params().get(param),
    /** `null` num parâmetro remove ele da URL. */
    escrever(mudancas: Params, { substituirHistorico = false }: OpcoesDeAplicacao = {}) {
      router.navigate([], {
        relativeTo: route,
        queryParams: mudancas,
        queryParamsHandling: MESCLAR_COM_A_URL,
        replaceUrl: substituirHistorico,
      });
    },
  };
}

export type ParametrosUrl = ReturnType<typeof injectParametrosUrl>;
