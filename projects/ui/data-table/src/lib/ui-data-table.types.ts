import { type Path, type ValueAt } from './path.types';

export type UiAlignment = 'start' | 'center' | 'end';

interface BaseColumn {
  title: string;
  align?: UiAlignment;
  /** Any CSS width: '8rem', '20%'… */
  width?: string;
}

/** Column bound to a value of the object. `format` receives the value already correctly typed. */
export type UiDataColumn<T, P extends Path<T> = Path<T>> =
  P extends Path<T>
    ? BaseColumn & {
        key: P;
        /** Identifier used by uiCell/uiColumnHeader. Default: the key itself. */
        id?: string;
        format?: (value: ValueAt<T, P>, row: T) => unknown;
      }
    : never;

/** Column that doesn't come from the object (actions, for example): its content comes from a uiCell. */
export type UiExtraColumn<T> = BaseColumn & {
  id: string;
  key?: never;
  format?: (value: undefined, row: T) => unknown;
};

export type UiColumn<T> = UiDataColumn<T> | UiExtraColumn<T>;

export interface UiCellContext {
  /** The value at the column's path (let-value). */
  $implicit: any;
  /** The whole row object (let-row="row"). */
  row: any;
  /** Row position (let-i="index"). */
  index: number;
}

export interface UiColumnHeaderContext {
  /** The column (let-column). */
  $implicit: UiColumn<any>;
}
