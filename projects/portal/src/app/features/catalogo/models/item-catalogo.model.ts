import {
  filtroBooleano,
  filtroOpcoes,
  type ListTableRequisicao,
  PARAM_LIGADO,
  PRIMEIRA_PAGINA,
  TODAS_AS_OPCOES,
  type ValoresDosCampos,
} from '@shared/list-table';

export { PARAM_LIGADO, PRIMEIRA_PAGINA };

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
export const TODAS_CATEGORIAS = TODAS_AS_OPCOES;

export const OPCOES_POR_PAGINA = [10, 20, 50] as const;
export const POR_PAGINA_PADRAO = OPCOES_POR_PAGINA[0];

/**
 * Nome de cada parâmetro na query string, tanto na URL da tela quanto na chamada à API:
 *   ?q=cafe&categoria=Bebidas&estoqueBaixo=true&pagina=2&porPagina=20&ordenarPor=preco&direcao=desc
 * Busca, paginação e ordenação usam os nomes padrão da list-table (LIST_TABLE_CONFIG_PADRAO).
 */
export const PARAMS_CATALOGO = {
  termo: 'q',
  categoria: 'categoria',
  estoqueBaixo: 'estoqueBaixo',
  pagina: 'pagina',
  porPagina: 'porPagina',
  ordenarPor: 'ordenarPor',
  direcao: 'direcao',
} as const;

/** Filtros específicos do catálogo (busca, paginação e ordenação já vêm da list-table). */
export const FILTROS_CATALOGO = {
  categoria: filtroOpcoes(PARAMS_CATALOGO.categoria, CATEGORIAS_CATALOGO),
  /** Só itens com estoque no mínimo ou abaixo dele. */
  estoqueBaixo: filtroBooleano(PARAMS_CATALOGO.estoqueBaixo),
};

export type FiltrosCatalogo = ValoresDosCampos<typeof FILTROS_CATALOGO>;

/** O que a tela pede para a API. Também é a chave do cache (ver catalogo.queries.ts). */
export type RequisicaoCatalogo = ListTableRequisicao<FiltrosCatalogo>;

/** Regra de negócio única para "estoque baixo": no mínimo ou abaixo dele. */
export function estaComEstoqueBaixo(item: ItemCatalogo): boolean {
  return item.estoque.quantidade <= item.estoque.minimo;
}
