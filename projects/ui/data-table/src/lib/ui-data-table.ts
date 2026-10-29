import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  inject,
  input,
  TemplateRef,
} from '@angular/core';
import { UiSkeleton } from '@supermercado/ui/skeleton';
import { UiTableImports } from '@supermercado/ui/table';
import { type Path } from './path.types';
import { readPath } from './path.utils';
import {
  type UiCellContext,
  type UiColumn,
  type UiColumnHeaderContext,
} from './ui-data-table.types';

/*
 * Table built from the data and a list of columns (like React's DataTable):
 *
 *   columns: UiColumn<Order>[] = [
 *     { key: 'user.name', title: 'Cliente' },
 *     { key: 'total', title: 'Total', format: (v) => currency(v), align: 'end' },
 *     { key: 'status', title: 'Status' },
 *     { id: 'actions', title: '' },                 // column that doesn't come from the object
 *   ];
 *
 *   <ui-data-table [data]="orders()" [columns]="columns">
 *     <ng-template uiCell="status" let-value let-row="row">
 *       <span ui-badge>{{ value }}</span>
 *     </ng-template>
 *     <ng-template uiCell="actions" let-row="row">
 *       <button ui-button (click)="edit(row)">Editar</button>
 *     </ng-template>
 *   </ui-data-table>
 *
 * What each cell shows: uiCell template → format → raw value.
 */

/** Replaces the cells of a column: <ng-template uiCell="status" let-value let-row="row"> */
@Directive({ selector: 'ng-template[uiCell]' })
export class UiCell {
  readonly uiCell = input.required<string>();
  readonly template = inject<TemplateRef<UiCellContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: UiCell, _ctx: unknown): _ctx is UiCellContext {
    return true;
  }
}

/** Replaces a column's title: <ng-template uiColumnHeader="status" let-column> */
@Directive({ selector: 'ng-template[uiColumnHeader]' })
export class UiColumnHeader {
  readonly uiColumnHeader = input.required<string>();
  readonly template = inject<TemplateRef<UiColumnHeaderContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: UiColumnHeader,
    _ctx: unknown,
  ): _ctx is UiColumnHeaderContext {
    return true;
  }
}

@Component({
  selector: 'ui-data-table',
  imports: [NgTemplateOutlet, UiTableImports, UiSkeleton],
  template: `
    <div ui-table-container>
      <table ui-table>
        <thead ui-thead>
          <tr ui-tr>
            @for (column of columns(); track idOf(column)) {
              <th
                ui-th
                scope="col"
                [style.text-align]="column.align ?? null"
                [style.width]="column.width"
              >
                @if (headers().get(idOf(column)); as template) {
                  <ng-container
                    [ngTemplateOutlet]="template"
                    [ngTemplateOutletContext]="{ $implicit: column }"
                  />
                } @else {
                  {{ column.title }}
                }
              </th>
            }
          </tr>
        </thead>

        <tbody ui-tbody [attr.aria-busy]="loading() || null">
          @if (loading()) {
            @for (i of skeletonRows(); track i) {
              <tr ui-tr>
                @for (column of columns(); track idOf(column)) {
                  <td ui-td><ui-skeleton /></td>
                }
              </tr>
            }
          } @else {
            @for (row of data(); track track(row, i); let i = $index) {
              <tr ui-tr>
                @for (column of columns(); track idOf(column)) {
                  <td ui-td [style.text-align]="column.align ?? null">
                    @if (cells().get(idOf(column)); as template) {
                      <ng-container
                        [ngTemplateOutlet]="template"
                        [ngTemplateOutletContext]="{
                          $implicit: value(row, column),
                          row: row,
                          index: i,
                        }"
                      />
                    } @else {
                      {{ text(row, column) }}
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr ui-tr>
                <td ui-td class="empty" [attr.colspan]="columns().length">
                  {{ emptyMessage() }}
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .empty {
      padding: calc(var(--space) * 6) calc(var(--space) * 2);
      color: var(--muted-foreground);
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiDataTable<T> {
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly UiColumn<T>[]>();
  /** Shows skeleton rows instead of the data. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** How many skeleton rows to show while loading. */
  readonly loadingRows = input(5);
  readonly emptyMessage = input('Nenhum registro encontrado.');
  /**
   * Identity of each row, so Angular reuses the DOM.
   * A path ('code') or a function. Default: the "id" property; without it, the position.
   */
  readonly trackBy = input<Path<T> | ((row: T) => unknown)>();

  private readonly cellTemplates = contentChildren(UiCell);
  private readonly headerTemplates = contentChildren(UiColumnHeader);

  protected readonly cells = computed(
    () => new Map(this.cellTemplates().map((c) => [c.uiCell(), c.template])),
  );
  protected readonly headers = computed(
    () => new Map(this.headerTemplates().map((c) => [c.uiColumnHeader(), c.template])),
  );
  protected readonly skeletonRows = computed(() =>
    Array.from({ length: this.loadingRows() }, (_, i) => i),
  );

  protected idOf(column: UiColumn<T>): string {
    return column.id ?? (column.key as string);
  }

  protected value(row: T, column: UiColumn<T>): unknown {
    if (!column.key) return undefined;
    return readPath(row, column.key);
  }

  protected text(row: T, column: UiColumn<T>): unknown {
    const value = this.value(row, column);
    const format = column.format as ((value: unknown, row: T) => unknown) | undefined;
    if (format) return format(value, row);
    return value ?? '';
  }

  protected track(row: T, index: number): unknown {
    const trackBy = this.trackBy();
    if (typeof trackBy === 'function') return trackBy(row);
    return readPath(row, trackBy ?? 'id') ?? index;
  }
}
