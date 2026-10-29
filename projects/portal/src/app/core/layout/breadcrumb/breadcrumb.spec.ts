import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { AppBreadcrumb } from './breadcrumb';
import { buildTrail, formatSegment } from './breadcrumb.utils';

@Component({ template: '' })
class EmptyPage {}

describe('formatSegment', () => {
  it('removes the hyphens and capitalizes each word', () => {
    expect(formatSegment('sem-permissao')).toBe('Sem Permissao');
    expect(formatSegment('produtos')).toBe('Produtos');
  });
});

describe('buildTrail', () => {
  it('builds one item per segment, each with the accumulated route', () => {
    expect(buildTrail('/produtos/novo-item?pagina=2#topo')).toEqual([
      { label: 'Produtos', route: '/produtos' },
      { label: 'Novo Item', route: '/produtos/novo-item' },
    ]);
  });

  it('is empty on /login', () => {
    expect(buildTrail('/login')).toEqual([]);
    expect(buildTrail('/login?voltar=%2Fprodutos')).toEqual([]);
  });
});

describe('AppBreadcrumb', () => {
  async function renderBreadcrumb(url: string) {
    await render(AppBreadcrumb, {
      providers: [
        provideRouter([
          { path: 'login', component: EmptyPage },
          { path: 'produtos/:id', component: EmptyPage },
        ]),
      ],
      initialRoute: url,
    });
  }

  it('shows links to the previous levels and the current one as the page', async () => {
    await renderBreadcrumb('/produtos/arroz-integral');
    expect(screen.getByRole('link', { name: 'Produtos' })).toHaveAttribute('href', '/produtos');
    expect(screen.getByText('Arroz Integral')).toHaveAttribute('aria-current', 'page');
  });

  it('does not show on /login', async () => {
    await renderBreadcrumb('/login');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
