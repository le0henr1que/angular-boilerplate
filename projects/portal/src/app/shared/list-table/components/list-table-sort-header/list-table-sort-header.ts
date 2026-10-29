import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { type IconName, UiIcon } from '@supermercado/ui/icon';
import { type Sort, SORT_DIRECTION, type SortDirection } from '../../models/list-table.models';

const UNSORTED_ICON: IconName = 'arrow-up-down';
const ICON_BY_DIRECTION: Record<SortDirection, IconName> = {
  [SORT_DIRECTION.asc]: 'arrow-up',
  [SORT_DIRECTION.desc]: 'arrow-down',
};

/** Clickable header of a sortable column. Presentational: it only reports the click. */
@Component({
  selector: 'app-list-table-sort-header',
  imports: [UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="button"
      [class.active]="direction()"
      [attr.aria-label]="label()"
      [attr.data-direction]="direction()"
      (click)="toggleSort.emit()"
    >
      {{ heading() }}
      <ui-icon [name]="icon()" />
    </button>
  `,
  styles: `
    .button {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    .button ui-icon {
      opacity: 0.4;
    }
    .button.active ui-icon {
      opacity: 1;
    }
    .button:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }
  `,
})
export class ListTableSortHeader {
  readonly heading = input.required<string>();
  /** Column id. */
  readonly field = input.required<string>();
  readonly sort = input.required<Sort | null>();
  /** Text for screen readers ("Ordenar por Preço"). */
  readonly label = input.required<string>();
  readonly toggleSort = output<void>();

  /** This column's direction; null when the current sort is by another column. */
  protected readonly direction = computed<SortDirection | null>(() => {
    const sort = this.sort();
    if (sort?.field !== this.field()) return null;
    return sort.direction;
  });

  protected readonly icon = computed<IconName>(() => {
    const direction = this.direction();
    if (!direction) return UNSORTED_ICON;
    return ICON_BY_DIRECTION[direction];
  });
}
