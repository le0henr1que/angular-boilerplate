import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { provideTestAppConfig } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TestBed } from '@angular/core/testing';
import { type AppEnvironment } from '@core/config/app-config';
import { AppHeader } from './header';

@Component({ template: '' })
class PaginaVazia {}

describe('AppHeader', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => vi.unstubAllGlobals());

  async function renderizar(url = '/inicio', ambiente: AppEnvironment = 'development') {
    const resultado = await render(AppHeader, {
      providers: [
        provideTestAppConfig({ appName: 'Portal Teste', environment: ambiente }),
        provideTestQueryClient(),
        provideRouter([
          { path: 'inicio', component: PaginaVazia },
          { path: 'produtos', component: PaginaVazia },
        ]),
      ],
      initialRoute: url,
    });
    return resultado;
  }

  it('mostra o nome do app vindo da configuração, com link para a raiz', async () => {
    await renderizar();
    expect(screen.getByRole('link', { name: /Portal Teste/ })).toHaveAttribute('href', '/');
  });

  it('mostra badge do ambiente fora de produção', async () => {
    await renderizar('/inicio', 'homologation');
    expect(screen.getByText('Homologação')).toBeInTheDocument();
  });

  it('não mostra badge de ambiente em produção', async () => {
    await renderizar('/inicio', 'production');
    expect(screen.queryByText(/Homologação|Desenvolvimento/)).not.toBeInTheDocument();
  });

  it('tem navegação principal com os links das páginas', async () => {
    await renderizar();
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    expect(nav).toContainElement(screen.getByRole('link', { name: 'Início' }));
    expect(screen.getByRole('link', { name: 'Produtos' })).toHaveAttribute('href', '/produtos');
  });

  it('marca o link da página atual com aria-current', async () => {
    await renderizar('/produtos');
    expect(screen.getByRole('link', { name: 'Produtos' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current');
  });

  it('alterna o tema pelo botão, com rótulo acessível que muda', async () => {
    const { detectChanges } = await renderizar();
    const botao = screen.getByRole('button', { name: 'Usar tema escuro' });

    await userEvent.click(botao);
    detectChanges();

    expect(document.documentElement).toHaveClass('dark');
    expect(screen.getByRole('button', { name: 'Usar tema claro' })).toBeInTheDocument();
  });

  it('mostra o indicador de sincronização enquanto alguma query busca dados', async () => {
    const { detectChanges } = await renderizar();
    expect(screen.queryByLabelText('Sincronizando dados')).not.toBeInTheDocument();

    let concluir!: (v: unknown) => void;
    const busca = TestBed.inject(QueryClient).fetchQuery({
      queryKey: ['qualquer'],
      queryFn: () => new Promise((resolve) => (concluir = resolve)),
    });
    await vi.waitFor(() => {
      detectChanges();
      expect(screen.getByLabelText('Sincronizando dados')).toBeInTheDocument();
    });

    concluir('ok');
    await busca;
    await vi.waitFor(() => {
      detectChanges();
      expect(screen.queryByLabelText('Sincronizando dados')).not.toBeInTheDocument();
    });
  });
});
