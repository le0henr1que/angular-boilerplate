import { type ELLIPSIS } from './ui-pagination.constants';

/** A page number or the ellipsis between two blocks. */
export type PaginationItem = number | typeof ELLIPSIS;

/**
 * - numbered: previous, page numbers (with ellipsis) and next;
 * - compact: first, previous, "Página 2 de 5", next and last (fits in a card footer).
 */
export type PaginationVariant = 'numbered' | 'compact';
