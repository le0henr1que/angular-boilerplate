import { computed } from '@angular/core';
import { type Params } from '@angular/router';
import { type CampoUrl, lerCampo, textoDoCampo } from '../models/campo-url';
import { filtroNumero } from '../models/filtros';
import { type Paginacao, PRIMEIRA_PAGINA } from '../models/list-table.models';
import { type ParametrosUrl } from './inject-parametros-url';

export interface ConfigPaginacao {
  paramPagina: string;
  paramPorPagina: string;
  habilitada: () => boolean;
  /** A primeira é o padrão. */
  opcoesPorPagina: () => readonly number[];
}

/** Página na URL: inteiro a partir da primeira; qualquer outra coisa vira a primeira. */
function campoPagina(param: string): CampoUrl<number> {
  return {
    param,
    padrao: PRIMEIRA_PAGINA,
    ler: (texto) => {
      const pagina = Number(texto);
      if (Number.isInteger(pagina) && pagina > PRIMEIRA_PAGINA) return pagina;
      return PRIMEIRA_PAGINA;
    },
  };
}

/** "Hook" de paginação na URL (?pagina=2&porPagina=20). Desligada, o estado é null. */
export function injectPaginacao(url: ParametrosUrl, config: ConfigPaginacao) {
  const pagina = campoPagina(config.paramPagina);
  const porPagina = computed(() => {
    const opcoes = config.opcoesPorPagina();
    return filtroNumero(config.paramPorPagina, opcoes[0], opcoes);
  });

  const estado = computed<Paginacao | null>(
    () => {
      if (!config.habilitada()) return null;
      return { pagina: lerCampo(pagina, url.ler), porPagina: lerCampo(porPagina(), url.ler) };
    },
    { equal: (a, b) => a?.pagina === b?.pagina && a?.porPagina === b?.porPagina },
  );

  return {
    estado,
    paramsDaPagina: (numero: number): Params => ({
      [pagina.param]: textoDoCampo(pagina, Math.max(PRIMEIRA_PAGINA, numero)),
    }),
    /** Itens por página fora das opções viram o padrão. Também volta para a 1ª página. */
    paramsDePorPagina: (quantidade: number): Params => {
      const campo = porPagina();
      return {
        [campo.param]: textoDoCampo(campo, campo.ler(String(quantidade))),
        [pagina.param]: null,
      };
    },
    /** Junto de qualquer troca de filtro/busca/ordenação: o resultado mudou. */
    paramsDaPrimeiraPagina: (): Params => ({ [pagina.param]: null }),
  };
}
