let counter = 0;

/** Unique id per instance, to link <label for> to its field when there are several list-tables. */
export function uniqueId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
