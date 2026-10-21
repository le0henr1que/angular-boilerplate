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
 * Loga a navegação do router:
 * - debug: início, fim (com duração) e cancelada (ex.: um gate redirecionou);
 * - error: falha ao abrir a tela. Em produção o caso típico é o chunk da tela não existir
 *   mais no servidor (deploy novo com a aba antiga aberta).
 *
 * Chame dentro de um contexto de injeção (ex.: provideAppInitializer).
 */
export function registrarLogDeNavegacao(): void {
  const router = inject(Router, { optional: true });
  if (!router) return;

  const log = inject(Logger).com('navegacao');
  let inicio = 0;

  router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((evento) => {
    if (evento instanceof NavigationStart) {
      inicio = performance.now();
      log.debug(`→ ${evento.url}`);
    } else if (evento instanceof NavigationEnd) {
      log.debug(`✓ ${evento.urlAfterRedirects} (${Math.round(performance.now() - inicio)} ms)`);
    } else if (evento instanceof NavigationCancel) {
      log.debug(`✗ ${evento.url} esgotado: ${evento.reason || 'redirecionada por um gate'}`);
    } else if (evento instanceof NavigationError) {
      log.error(`falhou ao abrir ${evento.url}`, evento.error);
    }
  });
}
