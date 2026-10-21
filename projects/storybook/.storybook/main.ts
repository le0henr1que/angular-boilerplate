import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  // Imagens usadas nas histórias (ex.: /mountains.jpg)
  staticDirs: ['../public'],
};

export default config;
