import { type Routes } from '@angular/router';

/** Feature entry point, lazy loaded by app.routes.ts. */
export default [
  {
    path: '',
    loadComponent: () => import('./pages/ecosystem-page/ecosystem-page'),
    title: 'Ecossistema',
  },
] satisfies Routes;
