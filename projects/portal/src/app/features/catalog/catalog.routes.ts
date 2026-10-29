import { type Routes } from '@angular/router';

/** Feature entry point, lazy loaded by app.routes.ts. */
export default [
  {
    path: '',
    loadComponent: () => import('./pages/catalog-page/catalog-page'),
    title: 'Catálogo',
  },
] satisfies Routes;
