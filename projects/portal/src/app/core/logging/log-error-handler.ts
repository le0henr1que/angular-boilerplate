import { type ErrorHandler, inject, Injectable } from '@angular/core';
import { Logger } from './logger';

/**
 * Substitui o ErrorHandler do Angular: todo erro não tratado (em componente, em evento,
 * em Promise sem catch) passa pelo Logger. Assim ele aparece no console E vai para o backend.
 * Os erros da janela chegam aqui pelo `provideBrowserGlobalErrorListeners()` do app.config.ts.
 */
@Injectable()
export class LogErrorHandler implements ErrorHandler {
  readonly #log = inject(Logger).com('erro');

  handleError(erro: unknown): void {
    this.#log.error('erro não tratado', erro);
  }
}
