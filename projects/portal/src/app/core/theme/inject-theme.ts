import { DOCUMENT, effect, inject, signal } from '@angular/core';
import { DARK_THEME_CLASS, PREFERS_DARK_QUERY, THEME_STORAGE_KEY } from './theme.constants';
import { THEME, type Theme } from './theme.enums';

const THEMES: readonly Theme[] = Object.values(THEME);

/** The other theme of each one: what toggle() switches to. */
const OPPOSITE: Record<Theme, Theme> = {
  [THEME.light]: THEME.dark,
  [THEME.dark]: THEME.light,
};

function readSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES.find((theme) => theme === saved) ?? null;
  } catch {
    return null; // private mode or blocked storage: carry on without remembering
  }
}

function systemTheme(document: Document): Theme {
  if (document.defaultView?.matchMedia(PREFERS_DARK_QUERY).matches) return THEME.dark;
  return THEME.light;
}

/**
 * Light/dark theme "hook" (a useTheme() in React).
 * Starts from the saved preference or, without one, from the operating system's.
 * The dark theme is just the "dark" class on <html> — supermercado.css handles the rest.
 */
export function injectTheme() {
  const document = inject(DOCUMENT);
  const theme = signal<Theme>(readSavedTheme() ?? systemTheme(document));

  // Like a useEffect: runs again whenever the "theme" signal changes.
  effect(() => {
    document.documentElement.classList.toggle(DARK_THEME_CLASS, theme() === THEME.dark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme());
    } catch {
      /* no storage, no problem */
    }
  });

  return {
    theme: theme.asReadonly(),
    toggle: () => theme.update((current) => OPPOSITE[current]),
  };
}
