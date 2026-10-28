import { InjectionToken, type Provider } from '@angular/core';

/** Nome de cada parte padrão da list-table na query string. */
export interface ListTableParams {
  busca: string;
  pagina: string;
  porPagina: string;
  ordenarPor: string;
  direcao: string;
}

export interface ListTableTextos {
  busca: string;
  buscaPlaceholder: string;
  limpar: string;
  itensPorPagina: string;
  atualizando: string;
  vazio: string;
  erroTitulo: string;
  erroDescricao: string;
  tentarDeNovo: string;
  total: (total: number) => string;
  ordenarPor: (coluna: string) => string;
}

export interface ListTableConfig {
  params: ListTableParams;
  textos: ListTableTextos;
  /** A primeira é o padrão. */
  opcoesPorPagina: readonly number[];
  /** Espera depois da última tecla antes de buscar. */
  debounceMs: number;
}

export const LIST_TABLE_CONFIG_PADRAO: ListTableConfig = {
  params: {
    busca: 'q',
    pagina: 'pagina',
    porPagina: 'porPagina',
    ordenarPor: 'ordenarPor',
    direcao: 'direcao',
  },
  textos: {
    busca: 'Pesquisar',
    buscaPlaceholder: 'Pesquisar…',
    limpar: 'Limpar',
    itensPorPagina: 'Itens por página',
    atualizando: 'Atualizando…',
    vazio: 'Nenhum registro encontrado.',
    erroTitulo: 'Não foi possível carregar os dados',
    erroDescricao: 'Verifique sua conexão e tente de novo.',
    tentarDeNovo: 'Tentar de novo',
    total: (total) => `${total} item(ns)`,
    ordenarPor: (coluna) => `Ordenar por ${coluna}`,
  },
  opcoesPorPagina: [10, 20, 50],
  debounceMs: 300,
};

export const LIST_TABLE_CONFIG = new InjectionToken<ListTableConfig>('LIST_TABLE_CONFIG', {
  factory: () => LIST_TABLE_CONFIG_PADRAO,
});

export interface ListTableConfigParcial {
  params?: Partial<ListTableParams>;
  textos?: Partial<ListTableTextos>;
  opcoesPorPagina?: readonly number[];
  debounceMs?: number;
}

/**
 * Troca os padrões da list-table. No app.config.ts vale para o app inteiro; nos `providers`
 * de um componente, só para as list-tables dentro dele.
 *
 *   providers: [provideListTable({ params: { busca: 'termo' }, textos: { vazio: 'Nada aqui.' } })]
 */
export function provideListTable(config: ListTableConfigParcial): Provider {
  return {
    provide: LIST_TABLE_CONFIG,
    useValue: {
      ...LIST_TABLE_CONFIG_PADRAO,
      ...config,
      params: { ...LIST_TABLE_CONFIG_PADRAO.params, ...config.params },
      textos: { ...LIST_TABLE_CONFIG_PADRAO.textos, ...config.textos },
    } satisfies ListTableConfig,
  };
}
