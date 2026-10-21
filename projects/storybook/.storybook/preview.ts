import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/angular';

const preview: Preview = {
  // Botão na barra do Storybook que alterna a classe "dark" no <html>.
  decorators: [
    withThemeByClassName({
      themes: { claro: '', escuro: 'dark' },
      defaultTheme: 'claro',
      parentSelector: 'html',
    }),
  ],
  parameters: {
    options: { storySort: { method: 'alphabetical' } },
  },
  // Gera a página "Docs" de cada componente automaticamente.
  tags: ['autodocs'],
};

export default preview;
