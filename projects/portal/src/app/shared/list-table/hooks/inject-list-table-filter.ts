import { computed, inject } from '@angular/core';
import { LIST_TABLE_CONTEXTO, type OpcoesDeAplicacao } from '../list-table.context';
import { type CampoUrl } from '../models/campo-url';

/**
 * "Hook" para criar um filtro novo: chame no componente do filtro, que deve estar DENTRO de
 * uma <app-list-table> (como child). Ele lê e grava o valor pela list-table, que cuida da URL,
 * de voltar para a página 1, do "Limpar" e de mandar o valor para a fonte de dados.
 *
 *   export class FiltroLoja {
 *     readonly filtro = input.required<CampoUrl<number>>();
 *     protected readonly loja = injectListTableFilter(this.filtro);
 *     // template: [value]="loja.valor()" (change)="loja.definir(+$any($event.target).value)"
 *   }
 */
export function injectListTableFilter<V>(campo: () => CampoUrl<V>) {
  const contexto = inject(LIST_TABLE_CONTEXTO);

  return {
    valor: computed(() => contexto.valorDoFiltro(campo())),
    definir: (valor: V, opcoes?: OpcoesDeAplicacao) =>
      contexto.aplicarFiltro(campo(), valor, opcoes),
    limpar: () => contexto.aplicarFiltro(campo(), campo().padrao),
  };
}
