import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { injectListTableFilter } from '../../../hooks/inject-list-table-filter';
import { type CampoUrl } from '../../../models/campo-url';

/**
 * Filtro liga/desliga (checkbox), pronto para usar dentro da <app-list-table>:
 *
 *   <app-list-table-filtro-booleano rotulo="Só estoque baixo" [filtro]="filtros.estoqueBaixo" />
 */
@Component({
  selector: 'app-list-table-filtro-booleano',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="checkbox">
      <input type="checkbox" [checked]="estado.valor()" (change)="aoMudar($event)" />
      {{ rotulo() }}
    </label>
  `,
  styles: `
    .checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 2.25rem;
      font-size: var(--text-sm);
      cursor: pointer;
    }
  `,
})
export class ListTableFiltroBooleano {
  readonly filtro = input.required<CampoUrl<boolean>>();
  readonly rotulo = input.required<string>();

  protected readonly estado = injectListTableFilter(this.filtro);

  protected aoMudar(evento: Event) {
    this.estado.definir((evento.target as HTMLInputElement).checked);
  }
}
