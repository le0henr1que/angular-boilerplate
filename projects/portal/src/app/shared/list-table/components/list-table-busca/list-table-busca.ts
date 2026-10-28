import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { type IconName, UiIcon } from '@supermercado/ui/icon';
import { UiInputGroupImports } from '@supermercado/ui/input';
import { UiLabel } from '@supermercado/ui/label';
import { idUnico } from '../../utils/id-unico';

const ICONE_BUSCA: IconName = 'search';

/** Campo de busca padrão da list-table. Apresentacional: o debounce fica no injectBusca. */
@Component({
  selector: 'app-list-table-busca',
  imports: [UiIcon, UiInputGroupImports, UiLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label ui-label [for]="id">{{ rotulo() }}</label>
    <div ui-input-group>
      <span ui-input-group-addon>
        <ui-icon [name]="icone" />
      </span>
      <input
        ui-input-group-input
        type="search"
        autocomplete="off"
        [id]="id"
        [placeholder]="placeholder()"
        [value]="texto()"
        (input)="aoDigitar($event)"
      />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  `,
})
export class ListTableBusca {
  readonly texto = input.required<string>();
  readonly rotulo = input.required<string>();
  readonly placeholder = input.required<string>();
  readonly digitar = output<string>();

  protected readonly id = idUnico('list-table-busca');
  protected readonly icone = ICONE_BUSCA;

  protected aoDigitar(evento: Event) {
    this.digitar.emit((evento.target as HTMLInputElement).value);
  }
}
