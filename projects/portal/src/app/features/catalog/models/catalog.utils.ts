import { type CatalogItem } from './catalog.types';

/** The single business rule for "low stock": at the minimum or below it. */
export function isLowStock(item: CatalogItem): boolean {
  return item.stock.quantity <= item.stock.minimum;
}
