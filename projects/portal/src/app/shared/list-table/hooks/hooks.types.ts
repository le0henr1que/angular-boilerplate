import { type Params } from '@angular/router';
import { type ApplyOptions, type Sort } from '../models/list-table.types';

export interface SearchConfig {
  param: string;
  enabled: () => boolean;
  debounceMs: number;
  /** Called when the text should go to the URL. */
  apply: (params: Params, options: ApplyOptions) => void;
}

export interface PaginationConfig {
  pageParam: string;
  pageSizeParam: string;
  enabled: () => boolean;
  /** The first one is the default. */
  pageSizeOptions: () => readonly number[];
}

export interface SortingConfig {
  fieldParam: string;
  directionParam: string;
  enabled: () => boolean;
  /** Ids of the sortable columns: a field outside them, coming from the URL, is ignored. */
  fields: () => readonly string[];
  /** Sort used when the URL has none. */
  defaultSort: () => Sort | null;
}
