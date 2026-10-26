import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { AppBreadcrumb, formatarSegmento, montarTrilha } from './breadcrumb';

@Component({ template: '' })
class PaginaVazia {}

describe('formatarSegmento', () => {
  it('tira os hífens e deixa cada palavra com inicial maiúscula', () => {
    expect(formatarSegmento('sem-permissao')).toBe('Sem Permissao');
    expect(formatarSegmento('produtos')).toBe('Produtos');
  });
});

describe('montarTrilha', () => {
  it('monta um item por segmento, cada um com a rota acumulada', () => {
    expect(montarTrilha('/produtos/novo-item?pagina=2#topo')).toEqual([
      { rotulo: 'Produtos', rota: '/produtos' },
      { rotulo: 'Novo Item', rota: '/produtos/novo-item' },
    ]);
  });

  it('fica vazia no /login', () => {
    expect(montarTrilha('/login')).toEqual([]);
    expect(montarTrilha('/login?voltar=%2Fprodutos')).toEqual([]);
  });
});

describe('AppBreadcrumb', () => {
  async function renderizar(url: string) {
    await render(AppBreadcrumb, {
      providers: [
        provideRouter([
          { path: 'login', component: PaginaVazia },
          { path: 'produtos/:id', component: PaginaVazia },
        ]),
      ],
      initialRoute: url,
    });
  }

  it('mostra links para os níveis anteriores e o atual como página', async () => {
    await renderizar('/produtos/arroz-integral');
    expect(screen.getByRole('link', { name: 'Produtos' })).toHaveAttribute('href', '/produtos');
    expect(screen.getByText('Arroz Integral')).toHaveAttribute('aria-current', 'page');
  });

  it('não aparece no /login', async () => {
    await renderizar('/login');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
