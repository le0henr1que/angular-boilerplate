import { type Routes } from '@angular/router';

/** Ponto de entrada da feature, carregado sob demanda (lazy) pelo app.routes.ts. */
export default [
  {
    path: '',
    loadComponent: () => import('./pages/catalogo-page/catalogo-page'),
    title: 'Catálogo',
  },
] satisfies Routes;
