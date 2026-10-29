import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  Router,
} from '@angular/router';
import { Auth } from '@core/auth/auth';
import { filter, map, take } from 'rxjs';

/**
 * Global loading "hook": true while the app doesn't have a whole screen to show yet.
 *
 * Covers what index.html doesn't (its spinner goes away when Angular renders App):
 *  - the 1st navigation, while the gates and the screen's chunk load;
 *  - heading to the Microsoft login/logout (bff/msal), until the browser changes pages.
 *    Without this, the header showed up empty for an instant and "flashed" before the redirect.
 *
 * Later navigations (with a screen already up) don't use this: the header spinner covers them.
 */
export function injectGlobalLoading() {
  const router = inject(Router);
  const auth = inject(Auth);

  const firstScreenReady = toSignal(
    router.events.pipe(
      filter(
        (event) =>
          event instanceof NavigationEnd ||
          event instanceof NavigationError ||
          event instanceof NavigationSkipped ||
          // Cancelled by a redirect (e.g. a gate sent to /login) = another navigation comes next.
          (event instanceof NavigationCancel && event.code !== NavigationCancellationCode.Redirect),
      ),
      take(1),
      map(() => true),
    ),
    { initialValue: false },
  );

  return computed(() => !firstScreenReady() || auth.leavingApp());
}
