import { ALL_OPTIONS, type AllOptions, NO_VALUE, TRUE_PARAM } from '../models/list-table.constants';
import { type UrlField } from '../models/url-field.types';

/*
 * Filter factories: each one returns a ready UrlField. For a new filter, use defineFilter()
 * with your own parse/serialize, or add another factory here.
 *
 *   export const ORDER_FILTERS = {
 *     status: optionsFilter(PARAMS.status, ORDER_STATUS),
 *     urgent: booleanFilter(PARAMS.urgent),
 *     store: defineFilter({ param: PARAMS.store, defaultValue: 0, parse: toStoreId }),
 *   };
 */

/** Typed identity: only lets TypeScript infer V from the object. */
export function defineFilter<V>(field: UrlField<V>): UrlField<V> {
  return field;
}

/** Free text. Leading and trailing spaces don't go to the URL. */
export function textFilter(param: string): UrlField<string> {
  return {
    param,
    defaultValue: NO_VALUE,
    parse: (text) => text ?? NO_VALUE,
    serialize: (value) => value.trim(),
  };
}

/** On/off (?param=true). Any other text in the URL means off. */
export function booleanFilter(param: string): UrlField<boolean> {
  return {
    param,
    defaultValue: false,
    parse: (text) => text === TRUE_PARAM,
    serialize: () => TRUE_PARAM,
  };
}

/** One of the options or ALL_OPTIONS. A value outside the list (typed in the URL) becomes "all". */
export function optionsFilter<const O extends string>(
  param: string,
  options: readonly O[],
): UrlField<O | AllOptions> {
  return {
    param,
    defaultValue: ALL_OPTIONS,
    parse: (text) => options.find((option) => option === text) ?? ALL_OPTIONS,
  };
}

/** Integer within `options` (when given); anything else becomes the default. */
export function numberFilter(
  param: string,
  defaultValue: number,
  options?: readonly number[],
): UrlField<number> {
  return {
    param,
    defaultValue,
    parse: (text) => {
      const value = Number(text);
      if (text === null || !Number.isInteger(value)) return defaultValue;
      if (options && !options.includes(value)) return defaultValue;
      return value;
    },
  };
}
