/** Name of the search field in the form (read with FormData on submit). */
export const TERM_FIELD = 'term';

/** Columns with their own cell template (uiCell): the same key in the definition and in the HTML. */
export const PRODUCT_COLUMN = {
  code: 'code',
  price: 'price',
  status: 'status',
} as const;
