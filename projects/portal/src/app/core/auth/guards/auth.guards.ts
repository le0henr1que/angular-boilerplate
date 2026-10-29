import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';
import { Auth } from '../auth';
import { AUTH_PATHS, DEFAULT_DESTINATION } from '../auth.constants';
import { type Role } from '../auth.enums';

/** URL the user tried to open, to send them back there after login. */
function targetUrl(router: Router): string {
  const navigation = router.currentNavigation();
  return navigation ? router.serializeUrl(navigation.extractedUrl) : router.url;
}

/**
 * Gate: signed-in users only. It is `canMatch`: whoever doesn't pass doesn't even download the
 * route's JS. Signed-out users go to the login (mock: /login screen; bff: straight to Microsoft).
 * With the `authentication` flag off, it always passes.
 */
export const requireLogin: CanMatchFn = () => {
  const auth = inject(Auth);
  if (!auth.enabled || auth.authenticated()) return true;
  return auth.goToLogin(targetUrl(inject(Router)));
};

/** Gate: only users with one of the roles. Honors the `authentication` and `roleControl` flags. */
export function requireRole(...roles: Role[]): CanMatchFn {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);
    if (auth.enabled && !auth.authenticated()) return auth.goToLogin(targetUrl(router));
    return auth.canAccess(...roles) || router.createUrlTree([AUTH_PATHS.forbidden]);
  };
}

/** Gate for the public session screens: only for users NOT signed in (and only with authentication on). */
export const guestOnly: CanMatchFn = () => {
  const auth = inject(Auth);
  if (auth.enabled && !auth.authenticated()) return true;
  return inject(Router).createUrlTree([DEFAULT_DESTINATION]);
};

/**
 * Gate for the /login screen: it only exists with the simulated (mock) login.
 * In bff, whoever opens /login (old bookmark) goes to /inicio, and from there requireLogin
 * leads to Microsoft.
 */
export const mockLoginOnly: CanMatchFn = () =>
  inject(Auth).hasLoginScreen || inject(Router).createUrlTree([DEFAULT_DESTINATION]);
