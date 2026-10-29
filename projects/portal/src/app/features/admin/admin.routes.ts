import { type Routes } from '@angular/router';

/** Entry point of the admin area. Protected in app.routes.ts (adminArea flag + admin role). */
export default [
  {
    path: '',
    loadComponent: () => import('./admin-page'),
    title: 'Administração',
  },
] satisfies Routes;
