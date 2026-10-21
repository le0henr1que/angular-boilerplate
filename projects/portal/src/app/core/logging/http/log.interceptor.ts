import {
  HttpContextToken,
  HttpErrorResponse,
  type HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { type NivelLog } from '../log-config';
import { Logger } from '../logger';

/** Header que liga a chamada do front ao log do backend: mesmo id dos dois lados. */
export const CABECALHO_CORRELACAO = 'X-Correlation-Id';

/**
 * Status que, para ESTA chamada, são resposta normal e não problema (vão como debug).
 * Ex.: o 401 de "quem está logado?" quando ninguém está:
 * `http.get(url, { context: new HttpContext().set(STATUS_ESPERADOS, [401]) })`.
 */
export const STATUS_ESPERADOS = new HttpContextToken<readonly number[]>(() => []);

export function criarId(): string {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

/** 2xx e status esperados: debug. 4xx: warn. 5xx e rede (status 0): error. */
function nivelDoStatus(status: number, esperados: readonly number[]): NivelLog {
  if (status < 400 || esperados.includes(status)) return 'debug';
  return status === 0 || status >= 500 ? 'error' : 'warn';
}

/**
 * Uma linha por chamada HTTP, quando ela termina:
 * `GET /api/produtos → 200 (812 ms)`.
 *
 * Também manda o `X-Correlation-Id` nas chamadas para o mesmo domínio (URL começando com `/`).
 * Em outro domínio não manda: header novo exigiria liberar CORS no servidor de lá.
 *
 * Registre como o PRIMEIRO interceptor, para medir o tempo total e ver o status final.
 */
export const logInterceptor: HttpInterceptorFn = (req, next) => {
  const log = inject(Logger).com('http');
  const correlacao = criarId();
  const mesmaOrigem = req.url.startsWith('/') && !req.url.startsWith('//');
  const comId = mesmaOrigem
    ? req.clone({ setHeaders: { [CABECALHO_CORRELACAO]: correlacao } })
    : req;

  const inicio = performance.now();
  const ms = () => Math.round(performance.now() - inicio);
  const esperados = req.context.get(STATUS_ESPERADOS);
  const chamada = `${req.method} ${req.url}`;

  return next(comId).pipe(
    tap({
      next: (evento) => {
        if (evento instanceof HttpResponse) {
          log.debug(`${chamada} → ${evento.status} (${ms()} ms)`, {
            correlacao,
            ...(req.params.keys().length ? { params: req.params.toString() } : {}),
          });
        }
      },
      error: (erro: unknown) => {
        const status = erro instanceof HttpErrorResponse ? erro.status : 0;
        const nivel = nivelDoStatus(status, esperados);
        log[nivel](`${chamada} → ${status || 'sem resposta'} (${ms()} ms)`, {
          correlacao,
          motivo: erro instanceof HttpErrorResponse ? erro.message : String(erro),
        });
      },
    }),
  );
};
