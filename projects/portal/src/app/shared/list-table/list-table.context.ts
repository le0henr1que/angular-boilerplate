import { InjectionToken, type Signal } from '@angular/core';
import { type CampoUrl } from './models/campo-url';

export interface OpcoesDeAplicacao {
  /** true: troca a entrada atual do histórico em vez de criar outra (ex.: enquanto digita). */
  substituirHistorico?: boolean;
}

/**
 * O que a list-table oferece para os filtros projetados nela (os "children").
 * É uma abstração: os filtros dependem deste contrato, não do componente.
 */
export interface ListTableContexto {
  /** Valor atual do filtro (lê signals: reativo dentro de computed/template). */
  valorDoFiltro<V>(campo: CampoUrl<V>): V;
  /** Grava o filtro na URL e volta para a primeira página. */
  aplicarFiltro<V>(campo: CampoUrl<V>, valor: V, opcoes?: OpcoesDeAplicacao): void;
  /** Algum filtro (ou a busca) diferente do padrão. */
  readonly temFiltro: Signal<boolean>;
  limparFiltros(): void;
}

/** Fornecido pela própria app-list-table; só existe dentro dela. */
export const LIST_TABLE_CONTEXTO = new InjectionToken<ListTableContexto>('LIST_TABLE_CONTEXTO');
