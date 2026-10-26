import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { injectFiltrosCatalogo } from './inject-filtros-catalogo';

/** Componente mínimo só para dar contexto de injeção ao hook (como um teste de hook no React). */
@Component({ template: '' })
class Host {
  readonly f = injectFiltrosCatalogo();
}

describe('injectFiltrosCatalogo', () => {
  async function abrir(url: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'catalogo', component: Host }])],
    });
    const harness = await RouterTestingHarness.create();
    const host = await harness.navigateByUrl(url, Host);
    const router = TestBed.inject(Router);
    const estavel = () => harness.fixture.whenStable();
    return { hook: host.f, router, estavel };
  }

  afterEach(() => vi.useRealTimers());

  it('lê filtros e página da URL', async () => {
    const { hook } = await abrir(
      '/catalogo?q=cafe&categoria=Bebidas&estoqueBaixo=true&pagina=3&porPagina=20',
    );
    expect(hook.filtros()).toEqual({
      termo: 'cafe',
      categoria: 'Bebidas',
      estoqueBaixo: true,
      pagina: 3,
      porPagina: 20,
    });
    expect(hook.temFiltro()).toBe(true);
  });

  it('troca valores inválidos da URL pelo padrão', async () => {
    const { hook } = await abrir('/catalogo?categoria=xyz&pagina=-2&porPagina=999');
    expect(hook.filtros()).toEqual({
      termo: '',
      categoria: '',
      estoqueBaixo: false,
      pagina: 1,
      porPagina: 10,
    });
    expect(hook.temFiltro()).toBe(false);
  });

  it('digitar() espera o debounce antes de gravar na URL', async () => {
    const { hook, router, estavel } = await abrir('/catalogo');
    vi.useFakeTimers();
    hook.digitar('caf');
    hook.digitar('cafe');
    expect(hook.termoDigitado()).toBe('cafe');
    expect(router.url).toBe('/catalogo'); // ainda não

    await vi.advanceTimersByTimeAsync(300);
    vi.useRealTimers();
    await estavel();
    expect(router.url).toBe('/catalogo?q=cafe');
  });

  it('não apaga o espaço que o usuário está digitando', async () => {
    const { hook, estavel } = await abrir('/catalogo');
    hook.digitar('suco ');
    hook.pesquisarAgora();
    await estavel();
    expect(hook.filtros().termo).toBe('suco');
    expect(hook.termoDigitado()).toBe('suco ');
  });

  it('trocar um filtro volta para a página 1', async () => {
    const { hook, router, estavel } = await abrir('/catalogo?pagina=4');
    hook.filtrarPorCategoria('Padaria');
    await estavel();
    expect(router.url).toBe('/catalogo?categoria=Padaria');
  });

  it('irParaPagina() mantém os filtros', async () => {
    const { hook, router, estavel } = await abrir('/catalogo?estoqueBaixo=true');
    hook.irParaPagina(2);
    await estavel();
    expect(router.url).toBe('/catalogo?estoqueBaixo=true&pagina=2');
  });

  it('limpar() tira os filtros e mantém os itens por página', async () => {
    const { hook, router, estavel } = await abrir('/catalogo?q=cafe&pagina=2&porPagina=50');
    hook.limpar();
    await estavel();
    expect(router.url).toBe('/catalogo?porPagina=50');
    expect(hook.termoDigitado()).toBe('');
  });
});
