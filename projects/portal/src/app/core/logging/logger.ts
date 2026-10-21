import { inject, Injectable, InjectionToken, signal } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';
import { LOG_PADRAO, type NivelLog, PESO_DO_NIVEL } from './log-config';

/** Um registro de log, já pronto para ir ao console ou ao backend. */
export interface RegistroLog {
  readonly nivel: NivelLog;
  /** De onde veio: 'http', 'navegacao', 'auth', 'produtos'... */
  readonly contexto: string;
  readonly mensagem: string;
  /** Dados extras, já com campos sensíveis mascarados. */
  readonly dados?: unknown;
  readonly erro?: ErroSerializado;
  /** O erro original (stack clicável no console). Só para o console: não vai ao backend. */
  readonly original?: unknown;
  /** ISO 8601. */
  readonly momento: string;
  /** Identifica a aba: junta todos os registros de uma mesma visita. */
  readonly sessao: string;
  /** Tela em que o usuário estava. */
  readonly rota: string;
}

export interface ErroSerializado {
  readonly nome: string;
  readonly mensagem: string;
  readonly stack?: string;
  readonly status?: number;
}

/** Para onde os registros vão (console, backend...). Registre com `multi: true`. */
export interface DestinoLog {
  registrar(registro: RegistroLog): void;
}

export const LOG_DESTINOS = new InjectionToken<readonly DestinoLog[]>('LOG_DESTINOS');

/** Chave do localStorage que guarda o nível escolhido em tempo de execução. */
export const CHAVE_NIVEL_SALVO = 'supermercado.log.nivel';

const CAMPO_SENSIVEL = /senha|password|token|secret|authorization|cookie|cpf|cartao|card/i;
const PROFUNDIDADE_MAXIMA = 5;

/** Copia os dados trocando valores de campos sensíveis por '***'. Nunca altera o original. */
export function mascarar(valor: unknown, profundidade = 0): unknown {
  if (valor === null || typeof valor !== 'object') return valor;
  if (profundidade >= PROFUNDIDADE_MAXIMA) return '[...]';
  if (Array.isArray(valor)) return valor.map((item) => mascarar(item, profundidade + 1));
  return Object.fromEntries(
    Object.entries(valor).map(([chave, item]) => [
      chave,
      CAMPO_SENSIVEL.test(chave) ? '***' : mascarar(item, profundidade + 1),
    ]),
  );
}

export function serializarErro(erro: unknown): ErroSerializado {
  if (erro instanceof Error) {
    const status = (erro as Error & { status?: unknown }).status;
    return {
      nome: erro.name,
      mensagem: erro.message,
      stack: erro.stack,
      ...(typeof status === 'number' ? { status } : {}),
    };
  }
  // HttpErrorResponse não herda de Error.
  if (typeof erro === 'object' && erro !== null && 'status' in erro && 'message' in erro) {
    const { status, message, name } = erro as { status: number; message: string; name?: string };
    return { nome: name ?? 'HttpErrorResponse', mensagem: message, status };
  }
  return { nome: 'Desconhecido', mensagem: String(erro) };
}

function lerNivelSalvo(): NivelLog | 'off' | null {
  try {
    const salvo = localStorage.getItem(CHAVE_NIVEL_SALVO);
    return salvo && salvo in PESO_DO_NIVEL ? (salvo as NivelLog | 'off') : null;
  } catch {
    return null;
  }
}

/**
 * Ponto único de log do app. Ninguém chama `console.*` direto: use o Logger.
 *
 * ```ts
 * readonly #log = inject(Logger).com('produtos');
 * this.#log.info('filtro aplicado', { status });
 * this.#log.error('falhou ao salvar', erro);
 * const fim = this.#log.medir('montar relatório'); ...; fim();
 * ```
 *
 * O que aparece depende do `log.nivel` do environment (dev: tudo; prod: só warn e error).
 */
@Injectable({ providedIn: 'root' })
export class Logger {
  readonly #config = inject(APP_CONFIG, { optional: true })?.log ?? LOG_PADRAO;
  readonly #destinos = inject(LOG_DESTINOS, { optional: true }) ?? [];
  readonly #sessao = Math.random().toString(36).slice(2, 10);

  /** Nível em vigor: o do environment, ou o escolhido em tempo de execução. */
  readonly nivel = signal<NivelLog | 'off'>(lerNivelSalvo() ?? this.#config.nivel);

  /** Logger com um contexto fixo (aparece como [contexto] em cada linha). */
  com(contexto: string): LogDeContexto {
    return new LogDeContexto(this, contexto);
  }

  /** Mudar o nível agora. `salvar` mantém a escolha depois do F5 (só nesta máquina). */
  definirNivel(nivel: NivelLog | 'off' | null, salvar = true): void {
    try {
      if (salvar && nivel) localStorage.setItem(CHAVE_NIVEL_SALVO, nivel);
      if (!nivel) localStorage.removeItem(CHAVE_NIVEL_SALVO);
    } catch {
      // Sem localStorage (aba anônima, bloqueado): vale só até o F5.
    }
    this.nivel.set(nivel ?? this.#config.nivel);
  }

  /** Vale a pena montar o registro? Use antes de cálculos caros só para log. */
  ativo(nivel: NivelLog): boolean {
    return PESO_DO_NIVEL[nivel] >= PESO_DO_NIVEL[this.nivel()];
  }

  registrar(nivel: NivelLog, contexto: string, mensagem: string, dados?: unknown): void {
    if (!this.ativo(nivel)) return;
    const ehErro =
      dados instanceof Error || (dados as { name?: unknown })?.name === 'HttpErrorResponse';
    const registro: RegistroLog = {
      nivel,
      contexto,
      mensagem,
      ...(dados === undefined
        ? {}
        : ehErro
          ? { erro: serializarErro(dados), original: dados }
          : { dados: mascarar(dados) }),
      momento: new Date().toISOString(),
      sessao: this.#sessao,
      rota: globalThis.location?.pathname ?? '',
    };
    for (const destino of this.#destinos) {
      try {
        destino.registrar(registro);
      } catch {
        // Um destino com defeito não pode derrubar o app nem os outros destinos.
      }
    }
  }
}

export class LogDeContexto {
  constructor(
    private readonly logger: Logger,
    readonly contexto: string,
  ) {}

  debug(mensagem: string, dados?: unknown): void {
    this.logger.registrar('debug', this.contexto, mensagem, dados);
  }

  info(mensagem: string, dados?: unknown): void {
    this.logger.registrar('info', this.contexto, mensagem, dados);
  }

  warn(mensagem: string, dados?: unknown): void {
    this.logger.registrar('warn', this.contexto, mensagem, dados);
  }

  /** Passe o erro em `dados`: ele vira `{ nome, mensagem, stack, status }`. */
  error(mensagem: string, dados?: unknown): void {
    this.logger.registrar('error', this.contexto, mensagem, dados);
  }

  /** Cronômetro: chame a função devolvida no fim. Registra em debug com a duração. */
  medir(mensagem: string): () => void {
    const inicio = performance.now();
    return () => this.debug(`${mensagem} (${Math.round(performance.now() - inicio)} ms)`);
  }
}
