import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { injectFiltrosProdutos } from './inject-filtros-produtos';

/** Componente mínimo só para dar contexto de injeção ao hook (como um teste de hook no React). */
@Component({ template: '' })
class Host {
  readonly f = injectFiltrosProdutos();
}

describe('injectFiltrosProdutos', () => {
  async function abrir(url: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'produtos', component: Host }])],
    });
    const harness = await RouterTestingHarness.create();
    const host = await harness.navigateByUrl(url, Host);
    return { hook: host.f, router: TestBed.inject(Router), harness };
  }

  it('lê os filtros da URL', async () => {
    const { hook } = await abrir('/produtos?q=banana&status=baixo');
    expect(hook.filtros()).toEqual({ termo: 'banana', status: 'baixo' });
    expect(hook.temFiltro()).toBe(true);
  });

  it('usa os valores padrão sem query params', async () => {
    const { hook } = await abrir('/produtos');
    expect(hook.filtros()).toEqual({ termo: '', status: 'todos' });
    expect(hook.temFiltro()).toBe(false);
  });

  it('ignora status inválido digitado na URL', async () => {
    const { hook } = await abrir('/produtos?status=xyz');
    expect(hook.filtros().status).toBe('todos');
  });

  it('pesquisar() grava o termo na URL e mantém o status', async () => {
    const { hook, router, harness } = await abrir('/produtos?status=disponivel');
    hook.pesquisar('  suco  ');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/produtos?q=suco&status=disponivel');
    expect(hook.filtros()).toEqual({ termo: 'suco', status: 'disponivel' });
  });

  it('filtrarPorStatus("todos") remove o parâmetro da URL', async () => {
    const { hook, router, harness } = await abrir('/produtos?q=banana&status=disponivel');
    hook.filtrarPorStatus('todos');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/produtos?q=banana');
  });

  it('limpar() deixa a URL sem filtros', async () => {
    const { hook, router, harness } = await abrir('/produtos?q=banana&status=disponivel');
    hook.limpar();
    await harness.fixture.whenStable();
    expect(router.url).toBe('/produtos');
    expect(hook.temFiltro()).toBe(false);
  });
});
