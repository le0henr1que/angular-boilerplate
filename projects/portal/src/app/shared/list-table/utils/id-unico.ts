let contador = 0;

/** Id único por instância, para ligar <label for> ao campo quando há várias list-tables. */
export function idUnico(prefixo: string): string {
  contador += 1;
  return `${prefixo}-${contador}`;
}
