export const STATUS_PRODUTO = ['disponivel', 'baixo', 'esgotado'] as const;
export type StatusProduto = (typeof STATUS_PRODUTO)[number];

export type Categoria = 'Hortifruti' | 'Padaria' | 'Bebidas' | 'Limpeza';

export interface Produto {
  codigo: string;
  nome: string;
  categoria: Categoria;
  fabricacao: string; // ISO (yyyy-mm-dd), como viria de uma API de verdade
  validade: string;
  preco: number;
  status: StatusProduto;
  fornecedor: string;
  loja: string;
}

/** Filtros da listagem. Também viram parte da chave do cache (ver produtos.queries.ts). */
export interface FiltrosProdutos {
  termo: string;
  status: StatusProduto | 'todos';
}

export const FILTROS_VAZIOS: FiltrosProdutos = { termo: '', status: 'todos' };

export const ROTULO_STATUS: Record<StatusProduto, string> = {
  disponivel: 'Disponível',
  baixo: 'Estoque baixo',
  esgotado: 'Esgotado',
};
