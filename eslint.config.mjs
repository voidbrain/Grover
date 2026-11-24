// @ts-check
// From the harness defaults (core/eslint.config.mjs and angular/eslint.config.mjs), for one repository with three parts:
// the framework-free backend (contracts, hub, agent, tools) and the Angular client. Prettier formats; ESLint finds mistakes.
import { readFileSync } from 'node:fs';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angularEslint from 'angular-eslint';
import prettierConfig from 'eslint-config-prettier';

// Copied harness tools stay byte-identical to the template, which lints them itself; Grover's own tools are linted here.
const copied = Object.keys(JSON.parse(readFileSync(new URL('./.harness.json', import.meta.url), 'utf8')).copied);

// The framework-free layers: no Angular, no browser. The client may import @grover/contracts, never the reverse.
const PURE_GLOBS = ['packages/**/*.ts', 'apps/hub/**/*.ts', 'apps/agent/**/*.ts', 'tools/**/*.ts'];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.angular/**',
      'data/**',
      // where CI checks the harness template out
      '.harness/**',
      ...copied,
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],
      // TypeScript resolves names; `no-undef` only misreports Node globals in .mjs files.
      'no-undef': 'off',
    },
  },
  {
    files: PURE_GLOBS,
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@angular/*'], message: 'This layer must stay framework-free.' }] },
      ],
    },
  },
  {
    // Tests poke at JSON bodies; `any` there is a test convenience, not a type hole in the product.
    files: ['**/test/**/*.ts', '**/*.spec.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  ...tseslint.config({
    files: ['apps/client/src/**/*.ts'],
    extends: [...angularEslint.configs.tsRecommended],
    processor: angularEslint.processInlineTemplates,
    rules: {
      // OnPush and standalone are the defaults in Angular v22: do not require them explicitly (docs/agents/angular.md).
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'gr', style: 'kebab-case' }],
    },
  }),
  ...tseslint.config({
    files: ['apps/client/src/**/*.html'],
    extends: [...angularEslint.configs.templateRecommended, ...angularEslint.configs.templateAccessibility],
  }),
  prettierConfig,
);
