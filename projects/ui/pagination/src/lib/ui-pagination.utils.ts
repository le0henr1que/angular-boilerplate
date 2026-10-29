import { ELLIPSIS } from './ui-pagination.constants';
import { type PaginationItem } from './ui-pagination.types';

/**
 * Pages to show: always the first, the last and `siblings` on each side of the current one.
 *   visiblePages(6, 20) → [1, 'ellipsis', 5, 6, 7, 'ellipsis', 20]
 */
export function visiblePages(current: number, total: number, siblings = 1): PaginationItem[] {
  const items: PaginationItem[] = [];
  for (let page = 1; page <= total; page++) {
    const near = Math.abs(page - current) <= siblings;
    if (page === 1 || page === total || near) {
      items.push(page);
    } else if (items.at(-1) !== ELLIPSIS) {
      items.push(ELLIPSIS);
    }
  }
  return items;
}
