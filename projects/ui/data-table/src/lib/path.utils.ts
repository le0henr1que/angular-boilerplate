/** Path separator of a dotted path ("user.name"). */
const PATH_SEPARATOR = '.';

/** readPath({ user: { name: 'Ana' } }, 'user.name') → 'Ana'. Null along the path → undefined. */
export function readPath(object: unknown, path: string): unknown {
  let current = object;
  for (const part of path.split(PATH_SEPARATOR)) {
    if (current == null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
