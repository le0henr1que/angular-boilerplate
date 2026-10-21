/** Do mais detalhado ao mais grave. */
export type NivelLog = 'debug' | 'info' | 'warn' | 'error';

/**
 * Configuração de log por ambiente (environments/*.ts → `log`).
 *
 * O `nivel` é o piso de tudo: abaixo dele nada é registrado (nem console, nem backend).
 * Em produção dá para baixar o piso na hora, sem novo deploy, pelo console do navegador:
 * `supermercadoLog.nivel('debug')` (ver provide-logging.ts).
 */
export interface LogConfig {
  /** Nível mínimo registrado. `'off'` desliga o log. */
  readonly nivel: NivelLog | 'off';
  /**
   * Envia os registros para o backend (em lote). `null` = só console.
   * `nivel` aqui é o mínimo enviado: normalmente `'warn'`, para não inundar o servidor.
   */
  readonly remoto: { readonly url: string; readonly nivel: NivelLog } | null;
}

export const PESO_DO_NIVEL: Record<NivelLog | 'off', number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  off: 99,
};

/** Usado quando não há APP_CONFIG (ex.: testes isolados): só erros, sem backend. */
export const LOG_PADRAO: LogConfig = { nivel: 'error', remoto: null };
