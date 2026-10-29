import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/angular';

const preview: Preview = {
  // Button in the Storybook toolbar that toggles the "dark" class on <html>.
  decorators: [
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
  ],
  parameters: {
    options: { storySort: { method: 'alphabetical' } },
  },
  // Generates each component's "Docs" page automatically.
  tags: ['autodocs'],
};

export default preview;
