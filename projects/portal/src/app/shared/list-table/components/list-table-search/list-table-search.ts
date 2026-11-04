import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UiIcon } from '@supermercado/ui/icon';
import { UiInputGroupImports } from '@supermercado/ui/input';
import { UiLabel } from '@supermercado/ui/label';
import { LIST_TABLE_ICON } from '../../models/list-table.constants';
import { uniqueId } from '../../utils/unique-id.utils';

/** The list-table's default search field. Presentational: the debounce lives in injectSearch. */
@Component({
  selector: 'app-list-table-search',
  imports: [UiIcon, UiInputGroupImports, UiLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label ui-label [for]="id" [class.sr-only]="hideLabel()">{{ label() }}</label>
    <div ui-input-group>
      <span ui-input-group-addon>
        <ui-icon [name]="icon" />
      </span>
      <input
        ui-input-group-input
        type="search"
        autocomplete="off"
        [id]="id"
        [placeholder]="placeholder()"
        [value]="text()"
        (input)="onInput($event)"
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
export class ListTableSearch {
  readonly text = input.required<string>();
  readonly label = input.required<string>();
  readonly placeholder = input.required<string>();
  /** Keeps the label only for screen readers (the icon and placeholder say what it is). */
  readonly hideLabel = input(false);
  readonly textChange = output<string>();

  protected readonly id = uniqueId('list-table-search');
  protected readonly icon = LIST_TABLE_ICON.search;

  protected onInput(event: Event) {
    this.textChange.emit((event.target as HTMLInputElement).value);
  }
}
