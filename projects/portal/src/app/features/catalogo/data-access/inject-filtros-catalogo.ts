import { computed, DestroyRef, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CATEGORIAS_CATALOGO,
  type CategoriaCatalogo,
  FILTROS_CATALOGO_VAZIOS,
  type FiltrosCatalogo,
  OPCOES_POR_PAGINA,
  type PorPagina,
} from '../models/item-catalogo.model';

/** Espera depois da última tecla antes de pesquisar. */
const DEBOUNCE_MS = 300;

const iguais = (a: FiltrosCatalogo, b: FiltrosCatalogo) =>
  a.termo === b.termo &&
  a.categoria === b.categoria &&
  a.estoqueBaixo === b.estoqueBaixo &&
  a.pagina === b.pagina &&
  a.porPagina === b.porPagina;

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
    () => {
      const categoria = params().get('categoria') ?? '';
      const pagina = Number(params().get('pagina'));
      const porPagina = Number(params().get('porPagina'));
      return {
        termo: params().get('q') ?? '',
        categoria: CATEGORIAS_CATALOGO.includes(categoria as CategoriaCatalogo)
          ? (categoria as CategoriaCatalogo)
          : '',
        estoqueBaixo: params().get('estoqueBaixo') === 'true',
        pagina: Number.isInteger(pagina) && pagina > 1 ? pagina : 1,
        porPagina: OPCOES_POR_PAGINA.includes(porPagina as PorPagina)
          ? (porPagina as PorPagina)
          : FILTROS_CATALOGO_VAZIOS.porPagina,
      };
    },
    { equal: iguais },
  );

  /**
   * O texto do campo de busca. Segue a URL ("voltar", "Limpar"), mas não apaga o espaço
   * que o usuário está digitando quando a URL volta com o termo sem ele.
   */
  const termoDigitado = linkedSignal<string, string>({
    source: () => filtros().termo,
    computation: (termoDaUrl, anterior) =>
      anterior && anterior.value.trim() === termoDaUrl ? anterior.value : termoDaUrl,
  });

  let espera: ReturnType<typeof setTimeout> | undefined;
  const cancelarEspera = () => clearTimeout(espera);
  inject(DestroyRef).onDestroy(cancelarEspera);

  /** Grava na URL. Sem `pagina` nas mudanças, volta para a 1 (o resultado mudou). */
  function aplicar(mudancas: Partial<FiltrosCatalogo>, substituirHistorico = false) {
    const proximo = { ...filtros(), pagina: 1, ...mudancas };
    router.navigate([], {
      relativeTo: route,
      replaceUrl: substituirHistorico,
      // null remove o parâmetro, para a URL ficar limpa com os valores padrão.
      queryParams: {
        q: proximo.termo.trim() || null,
        categoria: proximo.categoria || null,
        estoqueBaixo: proximo.estoqueBaixo ? 'true' : null,
        pagina: proximo.pagina > 1 ? proximo.pagina : null,
        porPagina:
          proximo.porPagina === FILTROS_CATALOGO_VAZIOS.porPagina ? null : proximo.porPagina,
      },
    });
  }

  return {
    /** Filtros aplicados (signal). Use como dependência da query. */
    filtros,
    /** Texto do campo de busca (signal); pode estar à frente da URL enquanto o debounce corre. */
    termoDigitado: termoDigitado.asReadonly(),
    temFiltro: computed(() => {
      const f = filtros();
      return f.termo !== '' || f.categoria !== '' || f.estoqueBaixo;
    }),

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
    filtrarPorCategoria: (categoria: FiltrosCatalogo['categoria']) => aplicar({ categoria }),
    filtrarEstoqueBaixo: (estoqueBaixo: boolean) => aplicar({ estoqueBaixo }),
    irParaPagina: (pagina: number) => aplicar({ pagina: Math.max(1, pagina) }),
    mudarPorPagina: (porPagina: PorPagina) => aplicar({ porPagina }),
    limpar() {
      cancelarEspera();
      aplicar({ ...FILTROS_CATALOGO_VAZIOS, porPagina: filtros().porPagina });
    },
  };
}
