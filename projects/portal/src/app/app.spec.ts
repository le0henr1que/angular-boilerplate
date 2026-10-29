import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Auth } from '@core/auth/auth';
import { provideTestAppConfig } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { render, screen } from '@testing-library/angular';
import { App } from './app';

@Component({ template: '<h1>Tela</h1>' })
class Screen {}

/** A route that never finishes opening, like the one waiting for the redirect to Microsoft. */
const neverOpens = () => new Promise<never>(() => undefined);

describe('App (global loading)', () => {
  const leavingApp = signal(false);

  async function open(initialRoute: string) {
    await render(App, {
      providers: [
        provideTestAppConfig({ features: { authentication: false } }),
        provideTestQueryClient(),
        provideRouter([
          { path: 'tela', component: Screen },
          { path: 'presa', canMatch: [neverOpens], component: Screen },
        ]),
        {
          provide: Auth,
          useValue: {
            leavingApp,
            user: () => null,
            authenticated: () => false,
            enabled: false,
            canAccess: () => true,
          },
        },
      ],
    });
    void TestBed.inject(Router).navigateByUrl(initialRoute);
  }

  const globalSpinner = () => document.querySelector('.global-loading');

  beforeEach(() => {
    leavingApp.set(false);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false })); // header theme
  });

  afterEach(() => vi.unstubAllGlobals());

  it('shows the loading until the 1st screen is ready, with the rest inert underneath', async () => {
    await open('/presa');
    expect(globalSpinner()).toBeInTheDocument();
    expect(screen.getByText('Carregando…')).toBeInTheDocument();
    expect(document.querySelector('main')).toHaveAttribute('inert');
  });

  it('goes away when the 1st navigation ends', async () => {
    await open('/tela');
    await vi.waitFor(() => expect(globalSpinner()).not.toBeInTheDocument());
    expect(document.querySelector('main')).not.toHaveAttribute('inert');
  });

  it('shows again when the page is about to leave for Microsoft (login/logout)', async () => {
    await open('/tela');
    await vi.waitFor(() => expect(globalSpinner()).not.toBeInTheDocument());

    leavingApp.set(true);
    await vi.waitFor(() => expect(globalSpinner()).toBeInTheDocument());
    expect(document.querySelector('app-header')).toHaveAttribute('inert');
  });
});
