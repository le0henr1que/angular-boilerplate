import { type UiColuna } from '@supermercado/ui/data-table';
import { type QueryKey } from '@tanstack/angular-query-experimental';
import { type Observable } from 'rxjs';

export const PRIMEIRA_PAGINA = 1;

export interface Paginacao {
  /** Começa em PRIMEIRA_PAGINA. */
  pagina: number;
  porPagina: number;
}

export const DIRECAO_ORDENACAO = {
  crescente: 'asc',
  decrescente: 'desc',
} as const;
export type DirecaoOrdenacao = (typeof DIRECAO_ORDENACAO)[keyof typeof DIRECAO_ORDENACAO];

export interface Ordenacao {
  /** Id da coluna (o `id` ou, sem ele, a `chave`). */
  campo: string;
  direcao: DirecaoOrdenacao;
}

/** Coluna do ui-data-table, mais o que só a list-table entende. */
export type ListTableColuna<T> = UiColuna<T> & {
  /** Mostra o botão de ordenar no cabeçalho. */
  ordenavel?: boolean;
};

/**
 * O que a list-table pede para a fonte de dados. Cada parte desligada vem como "vazia":
 * busca = '' (sem busca), paginacao = null, ordenacao = null.
 */
export interface ListTableRequisicao<F> {
  filtros: F;
  busca: string;
  paginacao: Paginacao | null;
  ordenacao: Ordenacao | null;
}

/** O que a fonte devolve. Uma resposta paginada da API (itens + totais) já tem esse formato. */
export interface ListTableResultado<T> {
  itens: readonly T[];
  /** Total que atende aos filtros (todas as páginas). */
  total: number;
  totalPaginas: number;
}

/**
 * De onde vêm os dados. A list-table cuida do cache (TanStack Query), do cancelamento e do
 * pré-carregamento da próxima página; a fonte só traduz a requisição para a API.
 */
export interface ListTableFonte<T, F> {
  /** Prefixo da chave do cache. A requisição completa é acrescentada a ele. */
  chave: QueryKey;
  buscar: (
    requisicao: ListTableRequisicao<F>,
  ) => Observable<ListTableResultado<T>> | Promise<ListTableResultado<T>>;
}

export function idDaColuna<T>(coluna: UiColuna<T>): string {
  return coluna.id ?? (coluna.chave as string);
}
