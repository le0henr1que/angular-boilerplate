// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/**
 * Boundary rules (who may import whom), in the same spirit as tarefas-app.
 * The library can't depend on Storybook, and nobody imports another component's internal
 * paths: everything goes through the public entry point (@supermercado/ui/<component>).
 */
const restrictions = {
  storybook: {
    group: ['**/storybook/**'],
    message: 'The library cannot depend on Storybook.',
  },
  otherComponentInternals: {
    group: ['../../../*/src/**', '@supermercado/ui/*/src/**'],
    message: 'Import through the public entry point: @supermercado/ui/<component>.',
  },
  // Project rule: no style/component libraries. Everything is hand-made in projects/ui.
  noStyleLibrary: {
    group: [
      '@spartan-ng/*',
      '@angular/material',
      '@angular/material/*',
      '@angular/cdk',
      '@angular/cdk/*',
      'primeng',
      'primeng/*',
      '@ng-bootstrap/*',
      'ngx-bootstrap',
      'ngx-bootstrap/*',
      '@ng-icons/*',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'tailwindcss',
    ],
    message: 'No style libraries: use (or hand-make) a component in @supermercado/ui.',
  },

  // ── Portal (same rules as tarefas-app) ──
  environment: {
    group: ['@env/*', '**/environments/*'],
    message: 'Use inject(APP_CONFIG). Only app.config.ts imports environments.',
  },
  mocks: {
    group: ['**/mocks/**'],
    message: 'The mock API is only registered in app.config.ts.',
  },
  features: {
    group: ['@features/*', '@features/*/**'],
    message: 'core/ and shared/ cannot depend on features.',
  },
  core: {
    group: ['@core/*'],
    message: 'shared/ must be generic and not depend on core/.',
  },
  otherFeatureInternals: {
    group: ['@features/*/**', '../../../*/**'],
    message: "Use the other feature's public API: import { … } from '@features/<name>'.",
  },
  dataAccess: {
    group: ['**/data-access/*'],
    message:
      'ui/ components are presentational: they receive data through input() and emit output().',
  },
};

const forbid = (...groups) => ['error', { patterns: groups }];

module.exports = defineConfig([
  { ignores: ['dist/**', 'out-tsc/**', 'node_modules/**', '.angular/**'] },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      'no-restricted-imports': forbid(restrictions.noStyleLibrary),
      '@angular-eslint/prefer-signals': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-console': ['error', { allow: ['debug', 'error'] }],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    // Visual components: selectors prefixed with "ui". Most apply to a native element,
    // to keep the semantics: <button ui-button>, <table ui-table>, <input ui-input>.
    files: ['projects/ui/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'ui', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: ['element', 'attribute'], prefix: 'ui', style: 'kebab-case' },
      ],
      // "x != null" is the idiomatic way to test null and undefined together.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-restricted-imports': forbid(
        restrictions.noStyleLibrary,
        restrictions.storybook,
        restrictions.otherComponentInternals,
      ),
    },
  },
  {
    files: ['projects/portal/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    },
  },
  {
    files: ['projects/portal/src/app/**/*.ts'],
    ignores: ['projects/portal/src/app/app.config.ts'],
    rules: {
      'no-restricted-imports': forbid(
        restrictions.noStyleLibrary,
        restrictions.environment,
        restrictions.mocks,
      ),
    },
  },
  {
    files: ['projects/portal/src/app/core/**/*.ts'],
    rules: {
      'no-restricted-imports': forbid(
        restrictions.noStyleLibrary,
        restrictions.environment,
        restrictions.mocks,
        restrictions.features,
      ),
    },
  },
  {
    files: ['projects/portal/src/app/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': forbid(
        restrictions.noStyleLibrary,
        restrictions.environment,
        restrictions.mocks,
        restrictions.features,
        restrictions.core,
      ),
    },
  },
  {
    files: ['projects/portal/src/app/features/**/*.ts'],
    rules: {
      'no-restricted-imports': forbid(
        restrictions.noStyleLibrary,
        restrictions.environment,
        restrictions.mocks,
        restrictions.otherFeatureInternals,
      ),
    },
  },
  {
    files: ['projects/portal/src/app/features/*/ui/**/*.ts'],
    rules: {
      'no-restricted-imports': forbid(
        restrictions.noStyleLibrary,
        restrictions.environment,
        restrictions.mocks,
        restrictions.otherFeatureInternals,
        restrictions.dataAccess,
      ),
    },
  },
  {
    // MSAL (~280 kB) stays out of the initial bundle: only its chunk (core/auth/msal/msal.chunk.ts)
    // may import it. Outside of it, only `import type` (erased at build) and dynamic import().
    files: ['projects/portal/src/**/*.ts'],
    ignores: [
      '**/*.spec.ts',
      'projects/portal/src/app/core/auth/msal/msal.chunk.ts',
      'projects/portal/src/app/core/auth/msal/provide-msal.ts',
      'projects/portal/src/app/core/auth/gateways/msal-auth-gateway.ts',
      'projects/portal/src/app/core/auth/http/msal-token.interceptor.ts',
    ],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@azure/*',
                '**/msal.chunk',
                '**/provide-msal',
                '**/msal-auth-gateway',
                '**/msal-token.interceptor',
              ],
              allowTypeImports: true,
              message:
                'MSAL only comes in through MsalLoader (dynamic import()); statically it would go into the initial bundle.',
            },
          ],
        },
      ],
    },
  },
  {
    // The Logger's console target is the only place in the portal that talks to the console directly.
    files: ['projects/portal/src/app/core/logging/targets/console.target.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['projects/storybook/**/*.ts'],
    rules: {
      'no-restricted-imports': forbid(
        restrictions.noStyleLibrary,
        restrictions.otherComponentInternals,
      ),
      // Stories are demos: Meta<{}> and console.log to show events are normal here.
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
    },
  },
]);
