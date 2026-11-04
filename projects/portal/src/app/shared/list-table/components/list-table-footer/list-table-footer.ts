import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { UiLabel } from '@supermercado/ui/label';
import { type PaginationVariant, UiPagination } from '@supermercado/ui/pagination';
import { UiSelect } from '@supermercado/ui/select';
import { FIRST_PAGE } from '../../models/list-table.constants';
import { LIST_TABLE_VARIANT, type ListTableVariant } from '../../models/list-table.enums';
import { uniqueId } from '../../utils/unique-id.utils';

/** Pagination look of each list-table variant. */
const PAGINATION_VARIANT: Record<ListTableVariant, PaginationVariant> = {
  [LIST_TABLE_VARIANT.plain]: 'numbered',
  [LIST_TABLE_VARIANT.card]: 'compact',
};

/** Page size + navigation between pages. Presentational. */
@Component({
  selector: 'app-list-table-footer',
  imports: [UiLabel, UiPagination, UiSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Card: "[10 ▾] Itens por página" (label after the select, visually only). -->
    <div class="page-size" [class.select-first]="compact()">
      <label ui-label [for]="id">{{ pageSizeLabel() }}</label>
      <select ui-select [id]="id" (change)="onPageSizeChange($event)">
        @for (option of pageSizeOptions(); track option) {
          <option [value]="option" [selected]="pageSize() === option">{{ option }}</option>
        }
      </select>
    </div>

    <!-- Compact: always visible ("Página 1 de 1"), like a status bar. -->
    @if (showPagination()) {
      <ui-pagination
        [page]="page()"
        [totalPages]="totalPages()"
        [variant]="paginationVariant()"
        (pageChange)="pageChange.emit($event)"
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
    .page-size {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }
    .page-size.select-first {
      flex-direction: row-reverse;
    }
    .page-size.select-first select {
      width: auto;
    }
  `,
})
export class ListTableFooter {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly pageSizeOptions = input.required<readonly number[]>();
  readonly pageSizeLabel = input.required<string>();
  readonly variant = input<ListTableVariant>(LIST_TABLE_VARIANT.plain);
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected readonly id = uniqueId('list-table-page-size');
  protected readonly compact = computed(() => this.variant() === LIST_TABLE_VARIANT.card);
  protected readonly paginationVariant = computed(() => PAGINATION_VARIANT[this.variant()]);
  protected readonly showPagination = computed(
    () => this.compact() || this.totalPages() > FIRST_PAGE,
  );

  protected onPageSizeChange(event: Event) {
    this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value));
  }
}
