import { DOCUMENT, effect, inject, signal } from '@angular/core';

const CHAVE = 'supermercado:tema';
type Tema = 'claro' | 'escuro';

function lerTemaSalvo(): Tema | null {
  try {
    const salvo = localStorage.getItem(CHAVE);
    return salvo === 'claro' || salvo === 'escuro' ? salvo : null;
  } catch {
    return null; // modo anônimo ou storage bloqueado: segue sem lembrar
  }
}

/**
 * "Hook" do tema claro/escuro (um useTema() no React).
 * Começa pela preferência salva ou, se não houver, pela do sistema operacional.
 * O tema escuro é só a classe "dark" no <html> — o supermercado.css cuida do resto.
 */
export function injectTema() {
  const documento = inject(DOCUMENT);
  const preferenciaDoSistema = documento.defaultView?.matchMedia('(prefers-color-scheme: dark)')
    .matches
    ? 'escuro'
    : 'claro';
  const tema = signal<Tema>(lerTemaSalvo() ?? preferenciaDoSistema);

  // Como um useEffect: roda de novo sempre que o signal "tema" muda.
  effect(() => {
    documento.documentElement.classList.toggle('dark', tema() === 'escuro');
    try {
      localStorage.setItem(CHAVE, tema());
    } catch {
      /* sem storage, sem problema */
    }
  });

  return {
    tema: tema.asReadonly(),
    alternar: () => tema.update((t) => (t === 'claro' ? 'escuro' : 'claro')),
  };
}
