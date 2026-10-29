import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { provideTestAppConfig } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TestBed } from '@angular/core/testing';
import { type AppEnvironment } from '@core/config/app-config.enums';
import { AppHeader } from './header';

@Component({ template: '' })
class EmptyPage {}

describe('AppHeader', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => vi.unstubAllGlobals());

  async function renderHeader(url = '/inicio', environment: AppEnvironment = 'development') {
    const result = await render(AppHeader, {
      providers: [
        provideTestAppConfig({ appName: 'Portal Teste', environment }),
        provideTestQueryClient(),
        provideRouter([
          { path: 'inicio', component: EmptyPage },
          { path: 'produtos', component: EmptyPage },
        ]),
      ],
      initialRoute: url,
    });
    return result;
  }

  it('shows the app name from the configuration, linking to the root', async () => {
    await renderHeader();
    expect(screen.getByRole('link', { name: /Portal Teste/ })).toHaveAttribute('href', '/');
  });

  it('shows the environment badge outside production', async () => {
    await renderHeader('/inicio', 'homologation');
    expect(screen.getByText('Homologação')).toBeInTheDocument();
  });

  it('shows no environment badge in production', async () => {
    await renderHeader('/inicio', 'production');
    expect(screen.queryByText(/Homologação|Desenvolvimento/)).not.toBeInTheDocument();
  });

  it('has a main navigation with the page links', async () => {
    await renderHeader();
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    expect(nav).toContainElement(screen.getByRole('link', { name: 'Início' }));
    expect(screen.getByRole('link', { name: 'Produtos' })).toHaveAttribute('href', '/produtos');
  });

  it('marks the current page link with aria-current', async () => {
    await renderHeader('/produtos');
    expect(screen.getByRole('link', { name: 'Produtos' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current');
  });

  it('toggles the theme with the button, with a changing accessible label', async () => {
    const { detectChanges } = await renderHeader();
    const button = screen.getByRole('button', { name: 'Usar tema escuro' });

    await userEvent.click(button);
    detectChanges();

    expect(document.documentElement).toHaveClass('dark');
    expect(screen.getByRole('button', { name: 'Usar tema claro' })).toBeInTheDocument();
  });

  it('shows the sync indicator while some query is fetching data', async () => {
    const { detectChanges } = await renderHeader();
    expect(screen.queryByLabelText('Sincronizando dados')).not.toBeInTheDocument();

    let resolveFetch!: (v: unknown) => void;
    const fetch = TestBed.inject(QueryClient).fetchQuery({
      queryKey: ['any'],
      queryFn: () => new Promise((resolve) => (resolveFetch = resolve)),
    });
    await vi.waitFor(() => {
      detectChanges();
      expect(screen.getByLabelText('Sincronizando dados')).toBeInTheDocument();
    });

    resolveFetch('ok');
    await fetch;
    await vi.waitFor(() => {
      detectChanges();
      expect(screen.queryByLabelText('Sincronizando dados')).not.toBeInTheDocument();
    });
  });
});
