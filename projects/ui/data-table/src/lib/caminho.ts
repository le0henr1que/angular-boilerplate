/*
 * Tipos e função para acessar valores por caminho com pontos ("user.name").
 * O TypeScript sugere os caminhos válidos e acusa erro de digitação.
 */

type Folha =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Date
  | readonly unknown[];

/** Profundidade máxima seguida nos objetos aninhados (evita tipos infinitos). */
type Nivel = [never, 0, 1, 2, 3, 4];

/** Todos os caminhos de T: "id" | "user" | "user.name" | "user.endereco.cidade"… */
export type Caminho<T, N extends number = 4> = [N] extends [never]
  ? never
  : T extends Folha
    ? never
    : {
        [K in keyof T & string]: NonNullable<T[K]> extends Folha
          ? K
          : K | `${K}.${Caminho<NonNullable<T[K]>, Nivel[N]>}`;
      }[keyof T & string];

/** Tipo do valor em T no caminho P. Se algo no meio pode ser nulo, o resultado pode ser undefined. */
export type ValorEm<T, P extends string> = P extends `${infer K}.${infer Resto}`
  ? K extends keyof T
    ?
        | ValorEm<NonNullable<T[K]>, Resto>
        | (null extends T[K] ? undefined : never)
        | (undefined extends T[K] ? undefined : never)
    : never
  : P extends keyof T
    ? T[P]
    : never;

/** lerCaminho({ user: { name: 'Ana' } }, 'user.name') → 'Ana'. Nulo no meio do caminho → undefined. */
export function lerCaminho(objeto: unknown, caminho: string): unknown {
  let atual = objeto;
  for (const parte of caminho.split('.')) {
    if (atual == null) return undefined;
    atual = (atual as Record<string, unknown>)[parte];
  }
  return atual;
}
