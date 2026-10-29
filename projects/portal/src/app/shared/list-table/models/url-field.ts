/*
 * Codec for a value stored in the query string. It is the building block of every piece of
 * list-table state (filters, search, pagination, sorting): each one reads and writes the URL on its own.
 */

/** Text that means "no value" in the URL. */
export const NO_VALUE = '';

export interface UrlField<V> {
  /** Name in the query string (?category=). */
  readonly param: string;
  /** The "no filter" value. Equal to the default = parameter left out of the URL. */
  readonly defaultValue: V;
  /** URL text → value. Receives null without the parameter; invalid text must become the default. */
  readonly parse: (text: string | null) => V;
  /** Value → URL text. Empty or null removes the parameter. Default: String(value). */
  readonly serialize?: (value: V) => string | null;
  /** For non-primitive values (lists, for example). Default: Object.is. */
  readonly equals?: (a: V, b: V) => boolean;
}

/** One UrlField per property of F: TypeScript complains if any is missing. */
export type UrlFields<F> = { readonly [K in keyof F]-?: UrlField<F[K]> };

/** The values a set of fields produces: FieldValues<typeof FILTERS>. */
export type FieldValues<C> = {
  -readonly [K in keyof C]: C[K] extends UrlField<infer V> ? V : never;
};

export function valuesEqual<V>(field: UrlField<V>, a: V, b: V): boolean {
  const equals = field.equals ?? Object.is;
  return equals(a, b);
}

export function readField<V>(field: UrlField<V>, readParam: (param: string) => string | null): V {
  return field.parse(readParam(field.param));
}

/** Text that goes to the URL; null when the value is the default (the Router drops the parameter). */
export function fieldToParam<V>(field: UrlField<V>, value: V): string | null {
  if (valuesEqual(field, value, field.defaultValue)) return null;
  const serialize = field.serialize ?? String;
  return serialize(value) || null;
}
