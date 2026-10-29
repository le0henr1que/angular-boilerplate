import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UiLabel } from '@supermercado/ui/label';
import { UiSelect } from '@supermercado/ui/select';
import { injectListTableFilter } from '../../../hooks/inject-list-table-filter';
import { type UrlField } from '../../../models/url-field.types';
import { uniqueId } from '../../../utils/unique-id.utils';

/**
 * Options list filter, ready to use inside <app-list-table>:
 *
 *   <app-list-table-options-filter
 *     label="Categoria" allLabel="Todas"
 *     [filter]="filters.category" [options]="categories" />
 */
@Component({
  selector: 'app-list-table-options-filter',
  imports: [UiLabel, UiSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label ui-label [for]="id">{{ label() }}</label>
    <select ui-select [id]="id" (change)="onChange($event)">
      @if (allLabel(); as all) {
        <option
          [value]="filter().defaultValue"
          [selected]="state.value() === filter().defaultValue"
        >
          {{ all }}
        </option>
      }
      @for (option of options(); track option) {
        <option [value]="option" [selected]="state.value() === option">
          {{ optionLabel()(option) }}
        </option>
      }
    </select>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  `,
})
export class ListTableOptionsFilter<V extends string> {
  readonly filter = input.required<UrlField<V>>();
  readonly options = input.required<readonly V[]>();
  readonly label = input.required<string>();
  /** Text of the "no filter" option (the filter's default). Empty = no such option. */
  readonly allLabel = input<string>();
  /** Text of each option. Default: the option itself. */
  readonly optionLabel = input<(option: V) => string>(String);

  protected readonly state = injectListTableFilter(this.filter);
  protected readonly id = uniqueId('list-table-options-filter');

  protected onChange(event: Event) {
    // The filter itself converts the text (and replaces an invalid value with the default).
    this.state.set(this.filter().parse((event.target as HTMLSelectElement).value));
  }
}
