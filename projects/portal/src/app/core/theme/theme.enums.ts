export const THEME = {
  light: 'light',
  dark: 'dark',
} as const;
export type Theme = (typeof THEME)[keyof typeof THEME];
