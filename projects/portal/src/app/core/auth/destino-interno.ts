/** Só aceita caminho interno: bloqueia "open redirect" (?voltarPara=https://site-malicioso). */
export function destinoInterno(url: string | null | undefined): string {
  return url?.startsWith('/') && !url.startsWith('//') ? url : '/inicio';
}
