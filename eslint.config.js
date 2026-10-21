// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/**
 * Regras de fronteira (quem pode importar quem), no mesmo espírito do tarefas-app.
 * A biblioteca não pode depender do Storybook, e ninguém importa caminhos internos de outro
 * componente: tudo passa pelo ponto de entrada público (@supermercado/ui/<componente>).
 */
const restricoes = {
  storybook: {
    group: ['**/storybook/**'],
    message: 'A biblioteca não pode depender do Storybook.',
  },
  internoDeOutroComponente: {
    group: ['../../../*/src/**', '@supermercado/ui/*/src/**'],
    message: 'Importe pelo ponto de entrada público: @supermercado/ui/<componente>.',
  },
  // Regra do projeto: nada de bibliotecas de estilo/componentes. Tudo é feito à mão em projects/ui.
  semLibDeEstilo: {
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
    message: 'Sem bibliotecas de estilo: use (ou crie à mão) um componente em @supermercado/ui.',
  },

  // ── Portal (mesmas regras do tarefas-app) ──
  environment: {
    group: ['@env/*', '**/environments/*'],
    message: 'Use inject(APP_CONFIG). Somente app.config.ts importa environments.',
  },
  mocks: {
    group: ['**/mocks/**'],
    message: 'A API simulada só é registrada no app.config.ts.',
  },
  features: {
    group: ['@features/*', '@features/*/**'],
    message: 'core/ e shared/ não podem depender de features.',
  },
  core: {
    group: ['@core/*'],
    message: 'shared/ deve ser genérico e não depender de core/.',
  },
  internoDeOutraFeature: {
    group: ['@features/*/**', '../../../*/**'],
    message: 'Use a API pública da outra feature: import { … } from "@features/<nome>".',
  },
  dataAccess: {
    group: ['**/data-access/*'],
    message:
      'Componentes de ui/ são apresentacionais: recebem dados por input() e emitem output().',
  },
};

const proibir = (...grupos) => ['error', { patterns: grupos }];

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
      'no-restricted-imports': proibir(restricoes.semLibDeEstilo),
      '@angular-eslint/prefer-signals': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-console': ['error', { allow: ['debug', 'error'] }],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    // Componentes visuais: seletores com prefixo "ui". A maioria se aplica a um elemento
    // nativo, para manter a semântica: <button ui-button>, <table ui-table>, <input ui-input>.
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
      // "x != null" é o jeito idiomático de testar null e undefined juntos.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-restricted-imports': proibir(
        restricoes.semLibDeEstilo,
        restricoes.storybook,
        restricoes.internoDeOutroComponente,
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
      'no-restricted-imports': proibir(
        restricoes.semLibDeEstilo,
        restricoes.environment,
        restricoes.mocks,
      ),
    },
  },
  {
    files: ['projects/portal/src/app/core/**/*.ts'],
    rules: {
      'no-restricted-imports': proibir(
        restricoes.semLibDeEstilo,
        restricoes.environment,
        restricoes.mocks,
        restricoes.features,
      ),
    },
  },
  {
    files: ['projects/portal/src/app/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': proibir(
        restricoes.semLibDeEstilo,
        restricoes.environment,
        restricoes.mocks,
        restricoes.features,
        restricoes.core,
      ),
    },
  },
  {
    files: ['projects/portal/src/app/features/**/*.ts'],
    rules: {
      'no-restricted-imports': proibir(
        restricoes.semLibDeEstilo,
        restricoes.environment,
        restricoes.mocks,
        restricoes.internoDeOutraFeature,
      ),
    },
  },
  {
    files: ['projects/portal/src/app/features/*/ui/**/*.ts'],
    rules: {
      'no-restricted-imports': proibir(
        restricoes.semLibDeEstilo,
        restricoes.environment,
        restricoes.mocks,
        restricoes.internoDeOutraFeature,
        restricoes.dataAccess,
      ),
    },
  },
  {
    // MSAL (~280 kB) fica fora do bundle inicial: só o chunk dele (core/auth/msal/msal.chunk.ts)
    // pode importá-lo. Fora dele, só `import type` (some no build) e import() dinâmico.
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
                'O MSAL só entra pelo CarregadorMsal (import() dinâmico); estático, iria para o bundle inicial.',
            },
          ],
        },
      ],
    },
  },
  {
    // O destino de console do Logger é o único lugar do portal que fala direto com o console.
    files: ['projects/portal/src/app/core/logging/destinos/console.destino.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['projects/storybook/**/*.ts'],
    rules: {
      'no-restricted-imports': proibir(
        restricoes.semLibDeEstilo,
        restricoes.internoDeOutroComponente,
      ),
      // Histórias são demonstração: Meta<{}> e console.log para mostrar eventos são normais aqui.
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
