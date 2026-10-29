import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { type Params } from '@angular/router';
import { UiAlertImports } from '@supermercado/ui/alert';
import { UiButton } from '@supermercado/ui/button';
import { type Path, UiCell, UiColumnHeader, UiDataTableImports } from '@supermercado/ui/data-table';
import { UiIcon } from '@supermercado/ui/icon';
import { UiSpinner } from '@supermercado/ui/spinner';
import { ListTableFooter } from './components/list-table-footer/list-table-footer';
import { ListTableSearch } from './components/list-table-search/list-table-search';
import { ListTableSortHeader } from './components/list-table-sort-header/list-table-sort-header';
import { injectFilters } from './hooks/inject-filters';
import { injectListQuery } from './hooks/inject-list-query';
import { injectPagination } from './hooks/inject-pagination';
import { injectSearch } from './hooks/inject-search';
import { injectSorting } from './hooks/inject-sorting';
import { injectUrlParams } from './hooks/inject-url-params';
import { LIST_TABLE_CONFIG, LIST_TABLE_CONTEXT, LIST_TABLE_LOGGER } from './list-table.tokens';
import { LIST_TABLE_ICON, NO_FILTERS } from './models/list-table.constants';
import {
  type ApplyOptions,
  type ListTableColumn,
  type ListTableContext,
  type ListTableRequest,
  type ListTableSource,
  type Sort,
} from './models/list-table.types';
import { type UrlField, type UrlFields } from './models/url-field.types';
import { columnId } from './utils/column.utils';
import { fieldToParam, readField } from './utils/url-field.utils';

/**
 * A complete API-backed listing: search, filters, sorting, pagination, states (loading,
 * refreshing, empty, error) and caching. Search, sorting and pagination are built in; the
 * screen only provides the data source, the columns and its own specific filters.
 *
 *   <app-list-table [source]="source" [columns]="columns" [filters]="filters">
 *     <!-- children: the controls of the specific filters -->
 *     <app-list-table-options-filter label="Status" [filter]="filters.status" [options]="status" />
 *
 *     <!-- custom cells and headers, forwarded to ui-data-table -->
 *     <ng-template uiCell="total" let-total>{{ total | currency: 'BRL' }}</ng-template>
 *   </app-list-table>
 *
 * Turning parts off: [search]="false", [sorting]="false", [pagination]="false".
 * State lives in the URL (?q=&page=&pageSize=&sortBy=&sortDirection= + filters): reloading or
 * sharing the link keeps everything, and "back" undoes the last change.
 *
 * New filters: create a component that calls injectListTableFilter(field) and add it as a child.
 */
@Component({
  selector: 'app-list-table',
  imports: [
    ListTableFooter,
    ListTableSearch,
    ListTableSortHeader,
    NgTemplateOutlet,
    UiAlertImports,
    UiButton,
    UiDataTableImports,
    UiIcon,
    UiSpinner,
  ],
  // Projected filters (children) inject this context to read and write their values.
  providers: [{ provide: LIST_TABLE_CONTEXT, useExisting: forwardRef(() => ListTable) }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-table.html',
  styleUrl: './list-table.scss',
})
export class ListTable<T, F extends object = Record<never, never>> implements ListTableContext {
  private readonly config = inject(LIST_TABLE_CONFIG);
  private readonly log = inject(LIST_TABLE_LOGGER);
  protected readonly texts = this.config.texts;
  protected readonly errorIcon = LIST_TABLE_ICON.error;

  // ── Inputs ──
  readonly source = input.required<ListTableSource<T, F>>();
  readonly columns = input.required<readonly ListTableColumn<T>[]>();
  /** The screen's specific filters (see models/filters.ts). */
  readonly filters = input<UrlFields<F>>(NO_FILTERS as UrlFields<F>);
  readonly search = input(true, { transform: booleanAttribute });
  readonly sorting = input(true, { transform: booleanAttribute });
  readonly pagination = input(true, { transform: booleanAttribute });
  /** Sort used when the URL has none. */
  readonly defaultSort = input<Sort | null>(null);
  readonly pageSizeOptions = input<readonly number[]>(this.config.pageSizeOptions);
  readonly searchPlaceholder = input(this.texts.searchPlaceholder);
  readonly emptyMessage = input(this.texts.empty);
  readonly errorTitle = input(this.texts.errorTitle);
  /** Identity of each row (forwarded to ui-data-table). */
  readonly trackBy = input<Path<T> | ((row: T) => unknown)>();

  // ── The screen's templates, forwarded to ui-data-table (it can't see them through <ng-content>) ──
  protected readonly cells = contentChildren(UiCell);
  private readonly screenHeaders = contentChildren(UiColumnHeader);

  protected readonly sortableColumns = computed(() => {
    if (!this.sorting()) return [];
    return this.columns()
      .filter((column) => column.sortable)
      .map((column) => ({ id: columnId(column), heading: column.title }));
  });
  /** A sortable column's header is the sort button; the others come from the screen. */
  protected readonly headers = computed(() => {
    const sortable = new Set(this.sortableColumns().map((column) => column.id));
    return this.screenHeaders().filter((header) => !sortable.has(header.uiColumnHeader()));
  });

  // ── Hooks (state in the URL) ──
  private readonly url = injectUrlParams();
  private readonly filtersState = injectFilters(this.filters, this.url);
  protected readonly searchState = injectSearch(this.url, {
    param: this.config.params.search,
    enabled: this.search,
    debounceMs: this.config.debounceMs,
    apply: (params, options) => this.navigateToFirstPage(params, options),
  });
  protected readonly paginationState = injectPagination(this.url, {
    pageParam: this.config.params.page,
    pageSizeParam: this.config.params.pageSize,
    enabled: this.pagination,
    pageSizeOptions: this.pageSizeOptions,
  });
  protected readonly sortingState = injectSorting(this.url, {
    fieldParam: this.config.params.sortBy,
    directionParam: this.config.params.sortDirection,
    enabled: this.sorting,
    fields: () => this.sortableColumns().map((column) => column.id),
    defaultSort: this.defaultSort,
  });

  /** Everything the source receives. Also the cache key. */
  readonly request = computed<ListTableRequest<F>>(() => ({
    filters: this.filtersState.values(),
    search: this.searchState.applied(),
    pagination: this.paginationState.state(),
    sort: this.sortingState.state(),
  }));

  protected readonly query = injectListQuery(this.source, this.request);

  readonly hasFilter = computed(() => this.filtersState.active() || this.searchState.active());

  constructor() {
    // Runs again whenever the request changes (filter, search, page, sort).
    effect(() => this.log.debug('request', this.request()));
  }

  // ── Public API (context for the filters and use through a template ref: #list) ──

  filterValue<V>(field: UrlField<V>): V {
    return readField(field, this.url.read);
  }

  applyFilter<V>(field: UrlField<V>, value: V, options?: ApplyOptions): void {
    this.navigateToFirstPage({ [field.param]: fieldToParam(field, value) }, options);
  }

  /** Several filters at once, typed: list.applyFilters({ status: 'paid' }). */
  applyFilters(changes: Partial<F>, options?: ApplyOptions): void {
    this.navigateToFirstPage(this.filtersState.toParams(changes), options);
  }

  clearFilters(): void {
    this.searchState.cancel();
    this.navigateToFirstPage({
      ...this.filtersState.clearParams(),
      ...this.searchState.clearParams(),
    });
  }

  reload(): void {
    this.query.refetch();
  }

  // ── Template events ──

  protected onSubmit(event: SubmitEvent) {
    event.preventDefault(); // otherwise the browser would reload the page
    this.searchState.applyNow();
  }

  protected sortBy(field: string) {
    this.navigateToFirstPage(this.sortingState.clickParams(field));
  }

  protected goToPage(page: number) {
    this.url.write(this.paginationState.pageParams(page));
  }

  protected changePageSize(size: number) {
    this.url.write(this.paginationState.pageSizeParams(size));
  }

  /** Any change to the result (filter, search, sort) goes back to the first page. */
  private navigateToFirstPage(params: Params, options?: ApplyOptions) {
    this.url.write({ ...params, ...this.paginationState.firstPageParams() }, options);
  }
}
