import { type Routes } from '@angular/router';

/** Feature entry point, lazy loaded by app.routes.ts. */
export default [
  {
    path: '',
    loadComponent: () => import('./pages/product-list-page/product-list-page'),
    title: 'Produtos',
  },
  {
    path: ':code',
    loadComponent: () => import('./pages/product-detail-page/product-detail-page'),
    title: 'Detalhe do produto',
  },
] satisfies Routes;
