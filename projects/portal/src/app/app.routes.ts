import { type Routes } from '@angular/router';
import {
  apenasLoginSimulado,
  apenasVisitante,
  exigeLogin,
  exigePapel,
} from '@core/auth/guards/auth.guards';
import { exigeFeature } from '@core/config/feature-flags';

// Toda feature é carregada sob demanda: o bundle inicial não cresce quando o app ganha telas.
// Os gates (canMatch) respeitam as feature flags do environment.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },

  // ── Públicas: só com a flag `autenticacao` ligada e para quem não está logado ──
  {
    // Login simulado (escolher persona): só no modo mock. No bff o login é a tela da Microsoft.
    path: 'login',
    canMatch: [apenasLoginSimulado, apenasVisitante],
    loadComponent: () => import('@features/login/login-page'),
    title: 'Entrar',
  },
  {
    // Para onde o backend redireciona depois do logout (bff).
    path: 'saiu',
    canMatch: [apenasVisitante],
    loadComponent: () => import('@features/login/sessao-page'),
    data: { motivo: 'saiu' },
    title: 'Você saiu',
  },
  {
    // O app voltou do login sem sessão: mostra o erro em vez de redirecionar em loop.
    path: 'erro-login',
    canMatch: [apenasVisitante],
    loadComponent: () => import('@features/login/sessao-page'),
    data: { motivo: 'erro' },
    title: 'Não foi possível entrar',
  },

  // ── Área logada: o gate no pai protege todos os filhos ──
  {
    path: '',
    canMatch: [exigeLogin],
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('@features/inicio/inicio-page'),
        title: 'Início',
        data: { preload: true },
      },
      {
        path: 'produtos',
        loadChildren: () => import('@features/produtos/produtos.routes'),
        data: { preload: true },
      },
      {
        path: 'catalogo',
        loadChildren: () => import('@features/catalogo/catalogo.routes'),
      },
      {
        path: 'fornecedores',
        canMatch: [exigeFeature('fornecedores')],
        loadChildren: () => import('@features/fornecedores/fornecedores.route'),
      },
      {
        // Sem preload: canMatch não impede o preload e o JS do admin iria para todo mundo.
        path: 'admin',
        canMatch: [exigeFeature('areaAdmin'), exigePapel('admin')],
        loadChildren: () => import('@features/admin/admin.routes'),
      },
      {
        path: 'sem-permissao',
        loadComponent: () => import('@core/layout/sem-permissao-page'),
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
