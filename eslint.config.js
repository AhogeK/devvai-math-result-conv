import path from 'node:path';
import { fileURLToPath } from 'node:url';

import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    files: [
      '**/*.vue',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
    ],
    languageOptions: { globals: globals.browser },
  },
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...compat.extends('@vue/eslint-config-typescript/recommended'),
  ...compat.extends('@vue/eslint-config-prettier/skip-formatting'),
];
