/*
 * Codec de um valor guardado na query string. É a peça básica de todo estado da list-table
 * (filtros, busca, paginação, ordenação): cada um sabe ler a URL e escrever nela sozinho.
 */

/** Texto que significa "sem valor" na URL. */
export const SEM_VALOR = '';

export interface CampoUrl<V> {
  /** Nome na query string (?categoria=). */
  readonly param: string;
  /** Valor "sem filtro". Igual ao padrão = parâmetro fora da URL. */
  readonly padrao: V;
  /** Texto da URL → valor. Recebe null sem o parâmetro; inválido deve virar o padrão. */
  readonly ler: (texto: string | null) => V;
  /** Valor → texto da URL. Vazio ou null tira o parâmetro. Padrão: String(valor). */
  readonly escrever?: (valor: V) => string | null;
  /** Para valores que não são primitivos (listas, por exemplo). Padrão: Object.is. */
  readonly igual?: (a: V, b: V) => boolean;
}

/** Um CampoUrl para cada propriedade de F: o TypeScript acusa se faltar algum. */
export type CamposUrl<F> = { readonly [K in keyof F]-?: CampoUrl<F[K]> };

/** Os valores que um conjunto de campos produz: ValoresDosCampos<typeof FILTROS>. */
export type ValoresDosCampos<C> = {
  -readonly [K in keyof C]: C[K] extends CampoUrl<infer V> ? V : never;
};

export function valoresIguais<V>(campo: CampoUrl<V>, a: V, b: V): boolean {
  const igual = campo.igual ?? Object.is;
  return igual(a, b);
}

export function lerCampo<V>(campo: CampoUrl<V>, lerParam: (param: string) => string | null): V {
  return campo.ler(lerParam(campo.param));
}

/** Texto que vai para a URL; null quando o valor é o padrão (o Router remove o parâmetro). */
export function textoDoCampo<V>(campo: CampoUrl<V>, valor: V): string | null {
  if (valoresIguais(campo, valor, campo.padrao)) return null;
  const escrever = campo.escrever ?? String;
  return escrever(valor) || null;
}
