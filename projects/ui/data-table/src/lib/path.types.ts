/*
 * Types to access values by dotted path ("user.name").
 * TypeScript suggests the valid paths and flags typos.
 */

type Leaf =
  string | number | boolean | bigint | symbol | null | undefined | Date | readonly unknown[];

/** Maximum depth followed into nested objects (avoids infinite types). */
type Depth = [never, 0, 1, 2, 3, 4];

/** Every path of T: "id" | "user" | "user.name" | "user.address.city"… */
export type Path<T, N extends number = 4> = [N] extends [never]
  ? never
  : T extends Leaf
    ? never
    : {
        [K in keyof T & string]: NonNullable<T[K]> extends Leaf
          ? K
          : K | `${K}.${Path<NonNullable<T[K]>, Depth[N]>}`;
      }[keyof T & string];

/** Type of the value in T at path P. If something along the way may be null, the result may be undefined. */
export type ValueAt<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? | ValueAt<NonNullable<T[K]>, Rest>
      | (null extends T[K] ? undefined : never)
      | (undefined extends T[K] ? undefined : never)
    : never
  : P extends keyof T
    ? T[P]
    : never;
