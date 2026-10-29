/** Every product status, in display order. */
export const PRODUCT_STATUSES = ['available', 'low', 'out-of-stock'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

/** Status filter value that means "every status". */
export const ALL_STATUSES = 'all';
export type StatusFilter = ProductStatus | typeof ALL_STATUSES;
