/** Formato de cada item que a API devolve. Objetos aninhados, como numa API real. */
export interface ItemCatalogo {
  id: number;
  nome: string;
  preco: number;
  categoria: { id: number; nome: string };
  fornecedor: { nome: string; cidade: string };
  estoque: { quantidade: number; minimo: number };
}

/** Resposta paginada de GET {apiUrl}/catalogo: só a página pedida, mais os totais. */
export interface PaginaCatalogo {
  itens: ItemCatalogo[];
  /** Total de itens que atendem aos filtros (todas as páginas). */
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

/** Caminho do recurso, relativo ao `apiUrl` do environment. */
export const CATALOGO_ENDPOINT = '/catalogo';

export const CATEGORIAS_CATALOGO = ['Hortifruti', 'Padaria', 'Bebidas', 'Limpeza'] as const;
export type CategoriaCatalogo = (typeof CATEGORIAS_CATALOGO)[number];

/** Valor do filtro de categoria que significa "todas" (sem filtro). */
export const TODAS_CATEGORIAS = '';
export type FiltroCategoria = CategoriaCatalogo | typeof TODAS_CATEGORIAS;

export const OPCOES_POR_PAGINA = [10, 20, 50] as const;
export type PorPagina = (typeof OPCOES_POR_PAGINA)[number];

export const PRIMEIRA_PAGINA = 1;

/**
 * Nome de cada filtro na query string, tanto na URL da tela quanto na chamada à API:
 *   ?q=cafe&categoria=Bebidas&estoqueBaixo=true&pagina=2&porPagina=20
 */
export const PARAMS_CATALOGO = {
  termo: 'q',
  categoria: 'categoria',
  estoqueBaixo: 'estoqueBaixo',
  pagina: 'pagina',
  porPagina: 'porPagina',
} as const;

/** Como um booleano ligado viaja na query string (?estoqueBaixo=true). */
export const PARAM_LIGADO = String(true);

/** Filtros enviados para a API. Também são a chave do cache (ver catalogo.queries.ts). */
export interface FiltrosCatalogo {
  /** Busca por nome do produto ou do fornecedor (?q=). */
  termo: string;
  /** TODAS_CATEGORIAS = sem filtro (?categoria=). */
  categoria: FiltroCategoria;
  /** Só itens com estoque no mínimo ou abaixo (?estoqueBaixo=true). */
  estoqueBaixo: boolean;
  /** Começa em PRIMEIRA_PAGINA (?pagina=). */
  pagina: number;
  porPagina: PorPagina;
}

export const FILTROS_CATALOGO_VAZIOS: FiltrosCatalogo = {
  termo: '',
  categoria: TODAS_CATEGORIAS,
  estoqueBaixo: false,
  pagina: PRIMEIRA_PAGINA,
  porPagina: OPCOES_POR_PAGINA[0],
};

export function ehCategoriaCatalogo(valor: unknown): valor is CategoriaCatalogo {
  return CATEGORIAS_CATALOGO.includes(valor as CategoriaCatalogo);
}

export function ehPorPagina(valor: unknown): valor is PorPagina {
  return OPCOES_POR_PAGINA.includes(valor as PorPagina);
}

/** Texto vindo de fora (URL, <select>) → categoria válida; qualquer outra coisa vira "todas". */
export function paraFiltroCategoria(valor: string | null): FiltroCategoria {
  if (ehCategoriaCatalogo(valor)) return valor;
  return TODAS_CATEGORIAS;
}

/** Texto vindo de fora → número de página válido; inválido ou menor que a 1ª vira a 1ª. */
export function paraPagina(valor: string | null): number {
  const pagina = Number(valor);
  if (Number.isInteger(pagina) && pagina > PRIMEIRA_PAGINA) return pagina;
  return PRIMEIRA_PAGINA;
}

/** Texto vindo de fora → opção de itens por página; fora das opções vira o padrão. */
export function paraPorPagina(valor: string | null): PorPagina {
  const porPagina = Number(valor);
  if (ehPorPagina(porPagina)) return porPagina;
  return FILTROS_CATALOGO_VAZIOS.porPagina;
}

/** Regra de negócio única para "estoque baixo": no mínimo ou abaixo dele. */
export function estaComEstoqueBaixo(item: ItemCatalogo): boolean {
  return item.estoque.quantidade <= item.estoque.minimo;
}

export function temFiltroAtivo(filtros: FiltrosCatalogo): boolean {
  return (
    filtros.termo !== FILTROS_CATALOGO_VAZIOS.termo ||
    filtros.categoria !== TODAS_CATEGORIAS ||
    filtros.estoqueBaixo
  );
}

export function filtrosIguais(a: FiltrosCatalogo, b: FiltrosCatalogo): boolean {
  return (
    a.termo === b.termo &&
    a.categoria === b.categoria &&
    a.estoqueBaixo === b.estoqueBaixo &&
    a.pagina === b.pagina &&
    a.porPagina === b.porPagina
  );
}
