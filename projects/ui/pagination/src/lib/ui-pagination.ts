import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { UiButton } from '@supermercado/ui/button';
import { UiIcon } from '@supermercado/ui/icon';
import { ELLIPSIS } from './ui-pagination.constants';
import { visiblePages } from './ui-pagination.utils';

/**
 * Navigation between pages. Keeps no state: receives the current page and reports the chosen one.
 *
 *   <ui-pagination [page]="page()" [totalPages]="total()" (pageChange)="goTo($event)" />
 */
@Component({
  selector: 'ui-pagination',
  imports: [UiButton, UiIcon],
  template: `
    <nav [attr.aria-label]="label()">
      <ul class="list">
        <li>
          <button
            ui-button
            variant="ghost"
            size="sm"
            type="button"
            [disabled]="page() <= 1"
            (click)="pageChange.emit(page() - 1)"
          >
            <ui-icon name="chevron-left" />
            Anterior
          </button>
        </li>
        @for (item of items(); track $index) {
          <li>
            @if (item === ellipsis) {
              <span class="ellipsis" aria-hidden="true">…</span>
            } @else {
              <button
                ui-button
                size="sm"
                type="button"
                class="number"
                [variant]="item === page() ? 'outline' : 'ghost'"
                [attr.aria-current]="item === page() ? 'page' : null"
                [attr.aria-label]="'Página ' + item"
                (click)="item !== page() && pageChange.emit(item)"
              >
                {{ item }}
              </button>
            }
          </li>
        }
        <li>
          <button
            ui-button
            variant="ghost"
            size="sm"
            type="button"
            [disabled]="page() >= totalPages()"
            (click)="pageChange.emit(page() + 1)"
          >
            Próxima
            <ui-icon name="chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }
    .list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .number {
      min-width: 2.25rem;
      font-variant-numeric: tabular-nums;
    }
    .ellipsis {
      display: inline-flex;
      justify-content: center;
      width: 2.25rem;
      color: var(--muted-foreground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  /** How many pages to show on each side of the current one. */
  readonly siblings = input(1);
  readonly label = input('Paginação');
  readonly pageChange = output<number>();

  protected readonly ellipsis = ELLIPSIS;
  protected readonly items = computed(() =>
    visiblePages(this.page(), this.totalPages(), this.siblings()),
  );
}
