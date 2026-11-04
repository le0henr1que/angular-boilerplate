export const SORT_DIRECTION = {
  asc: 'asc',
  desc: 'desc',
} as const;
export type SortDirection = (typeof SORT_DIRECTION)[keyof typeof SORT_DIRECTION];

/**
 * How the list-table is laid out:
 * - plain: filters, count, bordered table and footer stacked on the page;
 * - card: everything inside a card, heading and search in its header, edge-to-edge table and a
 *   compact footer ("Página 1 de 5").
 */
export const LIST_TABLE_VARIANT = {
  plain: 'plain',
  card: 'card',
} as const;
export type ListTableVariant = (typeof LIST_TABLE_VARIANT)[keyof typeof LIST_TABLE_VARIANT];
