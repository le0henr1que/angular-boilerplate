import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { Logger } from './logger';

/**
 * Logs router navigation:
 * - debug: start, end (with duration) and cancelled (e.g. a gate redirected);
 * - error: failed to open the screen. In production the typical case is the screen's chunk no
 *   longer existing on the server (new deploy with the old tab still open).
 *
 * Call it inside an injection context (e.g. provideAppInitializer).
 */
export function registerNavigationLog(): void {
  const router = inject(Router, { optional: true });
  if (!router) return;

  const log = inject(Logger).withContext('navigation');
  let start = 0;

  router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((event) => {
    if (event instanceof NavigationStart) {
      start = performance.now();
      log.debug(`→ ${event.url}`);
    } else if (event instanceof NavigationEnd) {
      log.debug(`✓ ${event.urlAfterRedirects} (${Math.round(performance.now() - start)} ms)`);
    } else if (event instanceof NavigationCancel) {
      log.debug(`✗ ${event.url} cancelled: ${event.reason || 'redirected by a gate'}`);
    } else if (event instanceof NavigationError) {
      log.error(`failed to open ${event.url}`, event.error);
    }
  });
}
