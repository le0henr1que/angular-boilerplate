import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { injectListTableFilter } from '../../../hooks/inject-list-table-filter';
import { type UrlField } from '../../../models/url-field';

/**
 * On/off filter (checkbox), ready to use inside <app-list-table>:
 *
 *   <app-list-table-boolean-filter label="Só estoque baixo" [filter]="filters.lowStock" />
 */
@Component({
  selector: 'app-list-table-boolean-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="checkbox">
      <input type="checkbox" [checked]="state.value()" (change)="onChange($event)" />
      {{ label() }}
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
export class ListTableBooleanFilter {
  readonly filter = input.required<UrlField<boolean>>();
  readonly label = input.required<string>();

  protected readonly state = injectListTableFilter(this.filter);

  protected onChange(event: Event) {
    this.state.set((event.target as HTMLInputElement).checked);
  }
}
