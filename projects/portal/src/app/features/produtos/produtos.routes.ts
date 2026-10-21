import { type Routes } from '@angular/router';

/** Ponto de entrada da feature, carregado sob demanda (lazy) pelo app.routes.ts. */
export default [
  {
    path: '',
    loadComponent: () => import('./pages/lista-produtos-page/lista-produtos-page'),
    title: 'Produtos',
  },
  {
    path: ':codigo',
    loadComponent: () => import('./pages/detalhe-produto-page/detalhe-produto-page'),
    title: 'Detalhe do produto',
  },
] satisfies Routes;
