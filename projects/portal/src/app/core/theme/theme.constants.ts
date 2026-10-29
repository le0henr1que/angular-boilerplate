/** localStorage key of the chosen theme. index.html reads the same key before Angular boots. */
export const THEME_STORAGE_KEY = 'supermercado:theme';

/** Class on <html> that turns the dark theme on (supermercado.css handles the rest). */
export const DARK_THEME_CLASS = 'dark';

/** Media query of the operating system's dark preference. */
export const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';
