import { computed, DestroyRef, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Params, Router } from '@angular/router';
import {
  FILTROS_CATALOGO_VAZIOS,
  type FiltroCategoria,
  type FiltrosCatalogo,
  filtrosIguais,
  PARAM_LIGADO,
  PARAMS_CATALOGO,
  paraFiltroCategoria,
  paraPagina,
  paraPorPagina,
  PRIMEIRA_PAGINA,
  type PorPagina,
  temFiltroAtivo,
  TODAS_CATEGORIAS,
} from '../models/item-catalogo.model';

/** Espera depois da última tecla antes de pesquisar. */
const DEBOUNCE_MS = 300;

/**
 * Filtros → query params da URL. Só entra o que difere do padrão; o resto vai como `null`,
 * que faz o Router remover o parâmetro e deixa a URL limpa.
 */
function paraQueryParams(filtros: FiltrosCatalogo): Params {
  const params: Params = {
    [PARAMS_CATALOGO.termo]: null,
    [PARAMS_CATALOGO.categoria]: null,
    [PARAMS_CATALOGO.estoqueBaixo]: null,
    [PARAMS_CATALOGO.pagina]: null,
    [PARAMS_CATALOGO.porPagina]: null,
  };
  const termo = filtros.termo.trim();
  if (termo) params[PARAMS_CATALOGO.termo] = termo;
  if (filtros.categoria !== TODAS_CATEGORIAS) params[PARAMS_CATALOGO.categoria] = filtros.categoria;
  if (filtros.estoqueBaixo) params[PARAMS_CATALOGO.estoqueBaixo] = PARAM_LIGADO;
  if (filtros.pagina > PRIMEIRA_PAGINA) params[PARAMS_CATALOGO.pagina] = filtros.pagina;
  if (filtros.porPagina !== FILTROS_CATALOGO_VAZIOS.porPagina) {
    params[PARAMS_CATALOGO.porPagina] = filtros.porPagina;
  }
  return params;
}

/**
 * "Hook" de filtros e paginação do catálogo — o equivalente a um useFiltrosCatalogo() no React.
 * Não sabe nada da tela nem da API: só lê e grava o estado. Quem usa decide o que fazer com ele.
 *
 * O estado mora na URL (?q=cafe&categoria=Bebidas&estoqueBaixo=true&pagina=2&porPagina=20):
 *  - recarregar ou compartilhar o link mantém a pesquisa e a página;
 *  - o "voltar" do navegador desfaz o último filtro ou a última troca de página.
 *
 * Desempenho:
 *  - a busca enquanto digita espera DEBOUNCE_MS sem teclar (não chama a API a cada letra) e
 *    usa replaceUrl (digitar não enche o histórico do navegador);
 *  - `filtros` só emite quando algum valor muda de fato (equal), então a query não roda à toa;
 *  - trocar qualquer filtro volta para a página 1.
 *
 * Como todo inject*(), só pode ser chamado na criação do componente.
 */
export function injectFiltrosCatalogo() {
  const router = inject(Router);
  const route = inject(ActivatedRoute);
  const params = toSignal(route.queryParamMap, { requireSync: true });

  /** Filtros aplicados, lidos da URL. Valores inválidos digitados na URL viram o padrão. */
  const filtros = computed<FiltrosCatalogo>(
    () => ({
      termo: params().get(PARAMS_CATALOGO.termo) ?? FILTROS_CATALOGO_VAZIOS.termo,
      categoria: paraFiltroCategoria(params().get(PARAMS_CATALOGO.categoria)),
      estoqueBaixo: params().get(PARAMS_CATALOGO.estoqueBaixo) === PARAM_LIGADO,
      pagina: paraPagina(params().get(PARAMS_CATALOGO.pagina)),
      porPagina: paraPorPagina(params().get(PARAMS_CATALOGO.porPagina)),
    }),
    { equal: filtrosIguais },
  );

  /**
   * O texto do campo de busca. Segue a URL ("voltar", "Limpar"), mas não apaga o espaço
   * que o usuário está digitando quando a URL volta com o termo sem ele.
   */
  const termoDigitado = linkedSignal<string, string>({
    source: () => filtros().termo,
    computation: (termoDaUrl, anterior) => {
      if (anterior && anterior.value.trim() === termoDaUrl) return anterior.value;
      return termoDaUrl;
    },
  });

  let espera: ReturnType<typeof setTimeout> | undefined;
  const cancelarEspera = () => clearTimeout(espera);
  inject(DestroyRef).onDestroy(cancelarEspera);

  /** Grava na URL. Sem `pagina` nas mudanças, volta para a 1ª (o resultado mudou). */
  function aplicar(mudancas: Partial<FiltrosCatalogo>, substituirHistorico = false) {
    router.navigate([], {
      relativeTo: route,
      replaceUrl: substituirHistorico,
      queryParams: paraQueryParams({ ...filtros(), pagina: PRIMEIRA_PAGINA, ...mudancas }),
    });
  }

  return {
    /** Filtros aplicados (signal). Use como dependência da query. */
    filtros,
    /** Texto do campo de busca (signal); pode estar à frente da URL enquanto o debounce corre. */
    termoDigitado: termoDigitado.asReadonly(),
    temFiltro: computed(() => temFiltroAtivo(filtros())),

    /** Busca enquanto digita, com debounce. */
    digitar(texto: string) {
      termoDigitado.set(texto);
      cancelarEspera();
      espera = setTimeout(() => aplicar({ termo: texto }, true), DEBOUNCE_MS);
    },
    /** Enter / botão "Pesquisar": aplica na hora, sem esperar o debounce. */
    pesquisarAgora() {
      cancelarEspera();
      aplicar({ termo: termoDigitado() });
    },
    filtrarPorCategoria: (categoria: FiltroCategoria) => aplicar({ categoria }),
    filtrarEstoqueBaixo: (estoqueBaixo: boolean) => aplicar({ estoqueBaixo }),
    irParaPagina: (pagina: number) => aplicar({ pagina: Math.max(PRIMEIRA_PAGINA, pagina) }),
    mudarPorPagina: (porPagina: PorPagina) => aplicar({ porPagina }),
    limpar() {
      cancelarEspera();
      aplicar({ ...FILTROS_CATALOGO_VAZIOS, porPagina: filtros().porPagina });
    },
  };
}
