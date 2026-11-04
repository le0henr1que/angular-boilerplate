import { type Routes } from '@angular/router';
import { SUPPLIERS_ROUTE } from './models/registration.constants';

/** Feature entry point, lazy loaded by app.routes.ts. Each tab of the layout is a child route. */
export default [
  {
    path: '',
    loadComponent: () => import('./pages/suppliers-layout/suppliers-layout'),
    children: [
      {
        path: SUPPLIERS_ROUTE.suppliers,
        pathMatch: 'full',
        loadComponent: () => import('./pages/supplier-list-page/supplier-list-page'),
        title: 'Fornecedores',
      },
      {
        path: SUPPLIERS_ROUTE.categories,
        loadComponent: () => import('./pages/category-list-page/category-list-page'),
        title: 'Categorias',
      },
    ],
  },
] satisfies Routes;
