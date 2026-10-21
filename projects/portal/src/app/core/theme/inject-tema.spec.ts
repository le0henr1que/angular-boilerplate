import { Component, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectTema } from './inject-tema';

@Component({ template: '' })
class Host {
  readonly tema = injectTema();
}

const CHAVE = 'supermercado:tema';

describe('injectTema', () => {
  let html: HTMLElement;

  /** Simula a preferência de tema do sistema operacional. */
  function sistemaPrefereEscuro(escuro: boolean) {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: escuro } as MediaQueryList));
  }

  function criar() {
    const fixture = TestBed.createComponent(Host);
    TestBed.tick(); // roda o effect que aplica a classe
    return fixture.componentInstance.tema;
  }

  beforeEach(() => {
    localStorage.clear();
    html = TestBed.inject(DOCUMENT).documentElement;
    html.classList.remove('dark');
    sistemaPrefereEscuro(false);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('segue a preferência do sistema quando não há nada salvo', () => {
    sistemaPrefereEscuro(true);
    const tema = criar();
    expect(tema.tema()).toBe('escuro');
    expect(html).toHaveClass('dark');
  });

  it('a escolha salva tem prioridade sobre o sistema', () => {
    sistemaPrefereEscuro(true);
    localStorage.setItem(CHAVE, 'claro');
    const tema = criar();
    expect(tema.tema()).toBe('claro');
    expect(html).not.toHaveClass('dark');
  });

  it('alternar() troca o tema, a classe do <html> e salva a escolha', () => {
    const tema = criar();
    expect(tema.tema()).toBe('claro');

    tema.alternar();
    TestBed.tick();
    expect(tema.tema()).toBe('escuro');
    expect(html).toHaveClass('dark');
    expect(localStorage.getItem(CHAVE)).toBe('escuro');

    tema.alternar();
    TestBed.tick();
    expect(html).not.toHaveClass('dark');
    expect(localStorage.getItem(CHAVE)).toBe('claro');
  });

  it('ignora valor inválido no storage', () => {
    localStorage.setItem(CHAVE, 'roxo');
    expect(criar().tema()).toBe('claro');
  });

  it('continua funcionando se o storage estiver bloqueado', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const tema = criar();
    expect(() => {
      tema.alternar();
      TestBed.tick();
    }).not.toThrow();
    expect(html).toHaveClass('dark');
    vi.restoreAllMocks();
  });
});
