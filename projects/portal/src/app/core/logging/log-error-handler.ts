import { type ErrorHandler, inject, Injectable } from '@angular/core';
import { Logger } from './logger';

/**
 * Replaces Angular's ErrorHandler: every unhandled error (in a component, an event handler,
 * a Promise without catch) goes through the Logger. So it shows in the console AND reaches the backend.
 * Window errors get here through `provideBrowserGlobalErrorListeners()` in app.config.ts.
 */
@Injectable()
export class LogErrorHandler implements ErrorHandler {
  readonly #log = inject(Logger).withContext('error');

  handleError(error: unknown): void {
    this.#log.error('unhandled error', error);
  }
}
