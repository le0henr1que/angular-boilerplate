import { type UrlField } from '../models/url-field.types';

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
