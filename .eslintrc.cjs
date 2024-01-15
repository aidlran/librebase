const { join } = require('path');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:svelte/recommended',
    'plugin:svelte/prettier',
    'plugin:prettier/recommended',
  ],
  plugins: ['deprecation'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    extraFileExtensions: ['.svelte'],
    sourceType: 'module',
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    browser: true,
    node: true,
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: 'tsconfig.json',
        tsconfigRootDir: join(__dirname, 'packages/svelte'),
      },
    },
    {
      files: ['packages/js/**/*.ts'],
      parserOptions: {
        tsconfigRootDir: join(__dirname, 'packages/js'),
      },
    },
    {
      files: ['packages/svelte/**/*.ts'],
      parserOptions: {
        tsconfigRootDir: join(__dirname, 'packages/svelte'),
      },
    },
    {
      files: ['*.test.*'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        'prefer-const': 'off',
      },
    },
  ],
  ignorePatterns: ['packages/*/coverage', 'packages/*/dist', 'playwright.config.ts'],
  rules: {
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    'deprecation/deprecation': 'warn',
    'no-console': 'error',
    'no-debugger': 'error',
  },
};
