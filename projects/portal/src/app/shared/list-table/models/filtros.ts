import { type CampoUrl, SEM_VALOR } from './campo-url';

/*
 * Fábricas de filtro: cada uma devolve um CampoUrl pronto. Para um filtro novo, use
 * definirFiltro() com o seu próprio ler/escrever, ou crie outra fábrica aqui.
 *
 *   export const FILTROS_PEDIDOS = {
 *     status: filtroOpcoes(PARAMS.status, STATUS_PEDIDO),
 *     urgente: filtroBooleano(PARAMS.urgente),
 *     loja: definirFiltro({ param: PARAMS.loja, padrao: 0, ler: paraIdDeLoja }),
 *   };
 */

/** Valor de um filtro de opções que significa "todas" (sem filtro). */
export const TODAS_AS_OPCOES = SEM_VALOR;
export type TodasAsOpcoes = typeof TODAS_AS_OPCOES;

/** Como um booleano ligado viaja na query string (?estoqueBaixo=true). */
export const PARAM_LIGADO = String(true);

/** Identidade com tipo: só serve para o TypeScript inferir V a partir do objeto. */
export function definirFiltro<V>(campo: CampoUrl<V>): CampoUrl<V> {
  return campo;
}

/** Texto livre. Espaços nas pontas não vão para a URL. */
export function filtroTexto(param: string): CampoUrl<string> {
  return {
    param,
    padrao: SEM_VALOR,
    ler: (texto) => texto ?? SEM_VALOR,
    escrever: (valor) => valor.trim(),
  };
}

/** Liga/desliga (?param=true). Qualquer outro texto na URL vira desligado. */
export function filtroBooleano(param: string): CampoUrl<boolean> {
  return {
    param,
    padrao: false,
    ler: (texto) => texto === PARAM_LIGADO,
    escrever: () => PARAM_LIGADO,
  };
}

/** Uma das opções ou TODAS_AS_OPCOES. Valor fora da lista (digitado na URL) vira "todas". */
export function filtroOpcoes<const O extends string>(
  param: string,
  opcoes: readonly O[],
): CampoUrl<O | TodasAsOpcoes> {
  return {
    param,
    padrao: TODAS_AS_OPCOES,
    ler: (texto) => opcoes.find((opcao) => opcao === texto) ?? TODAS_AS_OPCOES,
  };
}

/** Número inteiro dentro de `opcoes` (quando informadas); fora disso vira o padrão. */
export function filtroNumero(
  param: string,
  padrao: number,
  opcoes?: readonly number[],
): CampoUrl<number> {
  return {
    param,
    padrao,
    ler: (texto) => {
      const numero = Number(texto);
      if (texto === null || !Number.isInteger(numero)) return padrao;
      if (opcoes && !opcoes.includes(numero)) return padrao;
      return numero;
    },
  };
}
