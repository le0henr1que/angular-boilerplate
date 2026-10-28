import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { UiLabel } from '@supermercado/ui/label';
import { UiPagination } from '@supermercado/ui/pagination';
import { UiSelect } from '@supermercado/ui/select';
import { PRIMEIRA_PAGINA } from '../../models/list-table.models';
import { idUnico } from '../../utils/id-unico';

/** Itens por página + navegação entre páginas. Apresentacional. */
@Component({
  selector: 'app-list-table-rodape',
  imports: [UiLabel, UiPagination, UiSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="por-pagina">
      <label ui-label [for]="id">{{ rotuloPorPagina() }}</label>
      <select ui-select [id]="id" (change)="aoMudarPorPagina($event)">
        @for (opcao of opcoesPorPagina(); track opcao) {
          <option [value]="opcao" [selected]="porPagina() === opcao">{{ opcao }}</option>
        }
      </select>
    </div>

    @if (temVariasPaginas()) {
      <ui-pagination
        [pagina]="pagina()"
        [totalPaginas]="totalPaginas()"
        (mudarPagina)="mudarPagina.emit($event)"
      />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .por-pagina {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }
  `,
})
export class ListTableRodape {
  readonly pagina = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly porPagina = input.required<number>();
  readonly opcoesPorPagina = input.required<readonly number[]>();
  readonly rotuloPorPagina = input.required<string>();
  readonly mudarPagina = output<number>();
  readonly mudarPorPagina = output<number>();

  protected readonly id = idUnico('list-table-por-pagina');
  protected readonly temVariasPaginas = computed(() => this.totalPaginas() > PRIMEIRA_PAGINA);

  protected aoMudarPorPagina(evento: Event) {
    this.mudarPorPagina.emit(Number((evento.target as HTMLSelectElement).value));
  }
}
