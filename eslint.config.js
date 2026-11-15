import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { ignores: ['dist/', 'node_modules/', '.vitest/', 'coverage/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },
  {
    files: ['*.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
]);
