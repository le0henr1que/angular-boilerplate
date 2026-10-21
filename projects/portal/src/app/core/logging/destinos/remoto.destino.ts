import { type NivelLog, PESO_DO_NIVEL } from '../log-config';
import { type DestinoLog, type RegistroLog } from '../logger';

/** Junta até este código de registros antes de enviar. */
export const TAMANHO_DO_LOTE = 20;
/** Ou envia depois deste tempo, o que vier primeiro. */
export const INTERVALO_DE_ENVIO_MS = 5_000;
/** Backend fora do ar: guarda no máximo isto e descarta os mais antigos. */
export const MAXIMO_NA_FILA = 100;

/**
 * Envia os registros para o backend em lotes (POST JSON com um array de RegistroLog).
 *
 * - Erros vão na hora; o resto espera o lote ou o intervalo.
 * - Ao fechar/trocar de aba (`pagehide`) envia o que sobrou com `keepalive`.
 * - Usa `fetch` direto, sem HttpClient: assim os interceptors (inclusive o de log) não
 *   veem esse envio, e uma falha ao enviar log não gera outro log (loop).
 * - Falha ao enviar é ignorada: log nunca pode quebrar o app.
 */
export class RemotoDestino implements DestinoLog {
  #fila: Omit<RegistroLog, 'original'>[] = [];
  #timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly url: string,
    private readonly nivelMinimo: NivelLog,
    private readonly headers: Record<string, string> = {},
  ) {}

  registrar(registro: RegistroLog): void {
    if (PESO_DO_NIVEL[registro.nivel] < PESO_DO_NIVEL[this.nivelMinimo]) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { original, ...paraEnviar } = registro;
    if (this.#fila.length >= MAXIMO_NA_FILA) this.#fila.shift();
    this.#fila.push(paraEnviar);

    if (registro.nivel === 'error' || this.#fila.length >= TAMANHO_DO_LOTE) {
      this.enviar();
    } else {
      this.#timer ??= setTimeout(() => this.enviar(), INTERVALO_DE_ENVIO_MS);
    }
  }

  /** `saindo`: a página está fechando; `keepalive` deixa o envio terminar depois disso. */
  enviar(saindo = false): void {
    clearTimeout(this.#timer);
    this.#timer = undefined;
    if (this.#fila.length === 0) return;

    const lote = this.#fila.splice(0);
    fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.headers },
      body: JSON.stringify(lote),
      credentials: 'same-origin',
      keepalive: saindo,
    }).catch(() => undefined);
  }
}
