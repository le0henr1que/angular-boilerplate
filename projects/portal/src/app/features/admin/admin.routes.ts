import { type Routes } from '@angular/router';

/** Ponto de entrada da área admin. Protegida no app.routes.ts (flag areaAdmin + papel admin). */
export default [
  {
    path: '',
    loadComponent: () => import('./admin-page'),
    title: 'Administração',
  },
] satisfies Routes;
