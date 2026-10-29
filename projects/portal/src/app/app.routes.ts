import { type Routes } from '@angular/router';
import { ROLE } from '@core/auth/auth.enums';
import { guestOnly, mockLoginOnly, requireLogin, requireRole } from '@core/auth/guards/auth.guards';
import { requireFeature } from '@core/config/feature-flags';
import { SESSION_REASON } from '@features/login/session.enums';

// Every feature is lazy loaded: the initial bundle doesn't grow when the app gets screens.
// The gates (canMatch) honor the environment's feature flags.
// The `path` values are the app URLs (kept in Portuguese).
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },

  // ── Public: only with the `authentication` flag on and for users not signed in ──
  {
    // Simulated login (pick a persona): only in mock mode. In bff the login is the Microsoft screen.
    path: 'login',
    canMatch: [mockLoginOnly, guestOnly],
    loadComponent: () => import('@features/login/login-page'),
    title: 'Entrar',
  },
  {
    // Where the backend redirects after logout (bff).
    path: 'saiu',
    canMatch: [guestOnly],
    loadComponent: () => import('@features/login/session-page'),
    data: { reason: SESSION_REASON.signedOut },
    title: 'Você saiu',
  },
  {
    // The app came back from login without a session: shows the error instead of looping.
    path: 'erro-login',
    canMatch: [guestOnly],
    loadComponent: () => import('@features/login/session-page'),
    data: { reason: SESSION_REASON.error },
    title: 'Não foi possível entrar',
  },

  // ── Signed-in area: the gate on the parent protects every child ──
  {
    path: '',
    canMatch: [requireLogin],
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('@features/home/home-page'),
        title: 'Início',
        data: { preload: true },
      },
      {
        path: 'produtos',
        loadChildren: () => import('@features/products/products.routes'),
        data: { preload: true },
      },
      {
        path: 'catalogo',
        loadChildren: () => import('@features/catalog/catalog.routes'),
      },
      {
        path: 'ecossistema',
        loadChildren: () => import('@features/ecosystem/ecosystem.routes'),
      },
      {
        path: 'fornecedores',
        canMatch: [requireFeature('suppliers')],
        loadChildren: () => import('@features/suppliers/suppliers.routes'),
      },
      {
        // No preload: canMatch doesn't prevent preloading and the admin JS would ship to everyone.
        path: 'admin',
        canMatch: [requireFeature('adminArea'), requireRole(ROLE.admin)],
        loadChildren: () => import('@features/admin/admin.routes'),
      },
      {
        path: 'sem-permissao',
        loadComponent: () => import('@core/layout/forbidden-page'),
        title: 'Sem permissão',
      },
    ],
  },

  {
    path: '**',
    loadComponent: () => import('@core/layout/not-found-page'),
    title: 'Página não encontrada',
  },
];
