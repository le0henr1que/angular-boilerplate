import { type Routes } from '@angular/router';

/** Feature entry point, lazy loaded by app.routes.ts. */
export default [
  {
    path: '',
    loadComponent: () => import('./pages/supplier-list-page/supplier-list-page'),
    title: 'Fornecedores',
  },
] satisfies Routes;
