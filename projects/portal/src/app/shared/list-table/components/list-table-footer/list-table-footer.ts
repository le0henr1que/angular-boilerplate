import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { UiLabel } from '@supermercado/ui/label';
import { UiPagination } from '@supermercado/ui/pagination';
import { UiSelect } from '@supermercado/ui/select';
import { FIRST_PAGE } from '../../models/list-table.constants';
import { uniqueId } from '../../utils/unique-id.utils';

/** Page size + navigation between pages. Presentational. */
@Component({
  selector: 'app-list-table-footer',
  imports: [UiLabel, UiPagination, UiSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-size">
      <label ui-label [for]="id">{{ pageSizeLabel() }}</label>
      <select ui-select [id]="id" (change)="onPageSizeChange($event)">
        @for (option of pageSizeOptions(); track option) {
          <option [value]="option" [selected]="pageSize() === option">{{ option }}</option>
        }
      </select>
    </div>

    @if (hasManyPages()) {
      <ui-pagination
        [page]="page()"
        [totalPages]="totalPages()"
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
  `,
})
export class ListTableFooter {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly pageSizeOptions = input.required<readonly number[]>();
  readonly pageSizeLabel = input.required<string>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected readonly id = uniqueId('list-table-page-size');
  protected readonly hasManyPages = computed(() => this.totalPages() > FIRST_PAGE);

  protected onPageSizeChange(event: Event) {
    this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value));
  }
}
