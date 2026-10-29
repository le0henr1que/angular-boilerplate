import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  // Images used in the stories (e.g. /mountains.jpg)
  staticDirs: ['../public'],
};

export default config;
