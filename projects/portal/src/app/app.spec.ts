import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Auth } from '@core/auth/auth';
import { provideTestAppConfig } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { render, screen } from '@testing-library/angular';
import { App } from './app';

@Component({ template: '<h1>Tela</h1>' })
class Tela {}

/** Rota que nunca termina de abrir, como a que espera o redirect para a Microsoft. */
const nuncaAbre = () => new Promise<never>(() => undefined);

describe('App (carregamento global)', () => {
  const saindoDoApp = signal(false);

  async function abrir(rotaInicial: string) {
    await render(App, {
      providers: [
        provideTestAppConfig({ features: { autenticacao: false } }),
        provideTestQueryClient(),
        provideRouter([
          { path: 'tela', component: Tela },
          { path: 'presa', canMatch: [nuncaAbre], component: Tela },
        ]),
        {
          provide: Auth,
          useValue: {
            saindoDoApp,
            usuario: () => null,
            autenticado: () => false,
            ativa: false,
            podeAcessar: () => true,
          },
        },
      ],
    });
    void TestBed.inject(Router).navigateByUrl(rotaInicial);
  }

  const spinnerGlobal = () => document.querySelector('.carregamento-global');

  beforeEach(() => {
    saindoDoApp.set(false);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false })); // tema do cabeçalho
  });

  afterEach(() => vi.unstubAllGlobals());

  it('mostra o carregamento até a 1ª tela ficar pronta, com o resto inerte por baixo', async () => {
    await abrir('/presa');
    expect(spinnerGlobal()).toBeInTheDocument();
    expect(screen.getByText('Carregando…')).toBeInTheDocument();
    expect(document.querySelector('main')).toHaveAttribute('inert');
  });

  it('some quando a 1ª navegação termina', async () => {
    await abrir('/tela');
    await vi.waitFor(() => expect(spinnerGlobal()).not.toBeInTheDocument());
    expect(document.querySelector('main')).not.toHaveAttribute('inert');
  });

  it('volta a aparecer quando a página vai sair para a Microsoft (login/logout)', async () => {
    await abrir('/tela');
    await vi.waitFor(() => expect(spinnerGlobal()).not.toBeInTheDocument());

    saindoDoApp.set(true);
    await vi.waitFor(() => expect(spinnerGlobal()).toBeInTheDocument());
    expect(document.querySelector('app-header')).toHaveAttribute('inert');
  });
});
