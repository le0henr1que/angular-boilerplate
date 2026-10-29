import { type UiColumn } from '@supermercado/ui/data-table';

/** Column id: its `id` or, without one, its `key`. */
export function columnId<T>(column: UiColumn<T>): string {
  return column.id ?? (column.key as string);
}
