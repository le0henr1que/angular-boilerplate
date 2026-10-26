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

export const CATEGORIAS_CATALOGO = ['Hortifruti', 'Padaria', 'Bebidas', 'Limpeza'] as const;
export type CategoriaCatalogo = (typeof CATEGORIAS_CATALOGO)[number];

export const OPCOES_POR_PAGINA = [10, 20, 50] as const;
export type PorPagina = (typeof OPCOES_POR_PAGINA)[number];

/** Filtros enviados para a API. Também são a chave do cache (ver catalogo.queries.ts). */
export interface FiltrosCatalogo {
  /** Busca por nome do produto ou do fornecedor (?q=). */
  termo: string;
  /** '' = todas (?categoria=). */
  categoria: CategoriaCatalogo | '';
  /** Só itens com estoque no mínimo ou abaixo (?estoqueBaixo=true). */
  estoqueBaixo: boolean;
  /** Começa em 1 (?pagina=). */
  pagina: number;
  porPagina: PorPagina;
}

export const FILTROS_CATALOGO_VAZIOS: FiltrosCatalogo = {
  termo: '',
  categoria: '',
  estoqueBaixo: false,
  pagina: 1,
  porPagina: 10,
};
