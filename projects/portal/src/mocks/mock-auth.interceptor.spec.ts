import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { type FeatureFlags } from '@core/config/feature-flags';
import { provideTestAppConfig } from '@testing/test-config';
import { Auth, destinoInterno } from '@core/auth/auth';
import { authInterceptor } from '@core/auth/http/auth.interceptor';
import { mockAuthInterceptor } from './mock-auth.interceptor';
import { apagarSessaoMock, lerSessaoMock } from './sessao-mock';

@Component({ template: '' })
class Vazia {}

/** Auth real + gateway mock + API mock de auth: o fluxo inteiro do cookie, sem backend. */
function configurar(features: Partial<FeatureFlags> = {}) {
  TestBed.configureTestingModule({
    providers: [
      provideTestAppConfig({ features: { autenticacao: true, ...features } }),
      provideHttpClient(withInterceptors([authInterceptor, mockAuthInterceptor])),
      provideRouter([{ path: '**', component: Vazia }]),
    ],
  });
  return TestBed.inject(Auth);
}

describe('Auth (modo mock, sessão por cookie)', () => {
  beforeEach(() => apagarSessaoMock());
  afterEach(() => apagarSessaoMock());

  it('sem cookie de sessão, ninguém está logado', async () => {
    const auth = configurar();
    await auth.carregarSessao();
    expect(auth.autenticado()).toBe(false);
  });

  it('entrar cria o cookie, carrega o usuário e volta para a URL pedida', async () => {
    const auth = configurar();
    await auth.entrar('/produtos/HO-1', 'operador');

    expect(lerSessaoMock()?.id).toBe('operador');
    expect(auth.usuario()?.nome).toBe('Carlos Operador');
    expect(TestBed.inject(Router).url).toBe('/produtos/HO-1');
  });

  it('a sessão sobrevive a um "F5": um Auth novo lê o mesmo cookie', async () => {
    await configurar().entrar('/inicio', 'admin');
    TestBed.resetTestingModule();

    const auth = configurar();
    await auth.carregarSessao();
    expect(auth.usuario()?.nome).toBe('Ana Admin');
  });

  it('sair apaga o cookie e manda para o login', async () => {
    const auth = configurar();
    await auth.entrar('/inicio', 'admin');
    await auth.sair();

    expect(lerSessaoMock()).toBeNull();
    expect(auth.autenticado()).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('podeAcessar respeita papel e a flag controleDePapeis', async () => {
    const auth = configurar();
    await auth.entrar('/inicio', 'cliente');
    expect(auth.podeAcessar('admin')).toBe(false);
    expect(auth.podeAcessar('cliente')).toBe(true);

    TestBed.resetTestingModule();
    const semPapeis = configurar({ controleDePapeis: false });
    await semPapeis.carregarSessao();
    expect(semPapeis.podeAcessar('admin')).toBe(true);
  });

  it('com a flag autenticacao desligada não consulta sessão e libera tudo', async () => {
    const auth = configurar({ autenticacao: false });
    await auth.carregarSessao();
    expect(auth.ativa).toBe(false);
    expect(auth.podeAcessar('admin')).toBe(true);
  });
});

describe('destinoInterno (proteção contra open redirect)', () => {
  it.each([
    ['/produtos?q=1', '/produtos?q=1'],
    ['https://golpe.com', '/inicio'],
    ['//golpe.com', '/inicio'],
    ['javascript:alert(1)', '/inicio'],
    [undefined, '/inicio'],
  ])('%s → %s', (entrada, esperado) => {
    expect(destinoInterno(entrada)).toBe(esperado);
  });
});
