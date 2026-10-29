import { computed } from '@angular/core';
import { type Params } from '@angular/router';
import { fieldToParam, readField, valuesEqual } from '../utils/url-field.utils';
import { type UrlField, type UrlFields } from '../models/url-field.types';
import { type UrlParams } from './inject-url-params';

/**
 * Generic "hook" for a listing's specific filters. Takes the field definitions (they may change:
 * it is a signal, like an input) and returns the values read from the URL and the parameters to
 * write. It doesn't navigate: whoever composes it decides when (and together with what).
 */
export function injectFilters<F extends object>(fields: () => UrlFields<F>, url: UrlParams) {
  const keys = computed(() => Object.keys(fields()) as (keyof F & string)[]);
  const field = <K extends keyof F>(key: K): UrlField<F[K]> => fields()[key];

  /** Applied values. Only emits when some value actually changes (so the query doesn't rerun). */
  const values = computed<F>(
    () =>
      Object.fromEntries(
        keys().map((key) => [key, readField(field(key), url.read)]),
      ) as unknown as F,
    { equal: (a, b) => keys().every((key) => valuesEqual(field(key), a[key], b[key])) },
  );

  return {
    values,
    /** Some filter differs from its default. */
    active: computed(() =>
      keys().some((key) => !valuesEqual(field(key), values()[key], field(key).defaultValue)),
    ),
    /** Parameters for the given keys only. */
    toParams(changes: Partial<F>): Params {
      return Object.fromEntries(
        (Object.keys(changes) as (keyof F & string)[]).map((key) => [
          field(key).param,
          fieldToParam(field(key), changes[key] as F[typeof key]),
        ]),
      );
    },
    /** Removes every filter from the URL. */
    clearParams(): Params {
      return Object.fromEntries(keys().map((key) => [field(key).param, null]));
    },
  };
}
