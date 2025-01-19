import pluginJs from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  pluginJs.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        Express: 'readonly',
      },
    },
  },
  { plugins: { '@stylistic/js': stylisticJs } },
  { ignores: ['**/node_modules/', '/**/tsconfig.json'] },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'no-unused-vars': 'off',
      'constructor-super': 'warn',
      'for-direction': 'warn',
      'getter-return': 'warn',
      'no-async-promise-executor': 'warn',
      'no-class-assign': 'warn',
      'no-compare-neg-zero': 'warn',
      'no-cond-assign': 'warn',
      'no-dupe-else-if': 'warn',
      'no-unreachable': 'warn',
      'no-unsafe-optional-chaining': 'warn',
      'no-unsafe-negation': 'warn',
      'no-unused-private-class-members': 'warn',
      'use-isnan': 'warn',
      'valid-typeof': 'warn',
      'no-empty-static-block': 'warn',
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: 'multiline-block-like', next: 'const' },
        { blankLine: 'always', prev: 'const', next: 'multiline-block-like' },
        {
          blankLine: 'always',
          prev: 'multiline-block-like',
          next: 'multiline-block-like',
        },

        { blankLine: 'always', prev: 'class', next: 'multiline-block-like' },
        { blankLine: 'always', prev: 'multiline-block-like', next: 'class' },
        { blankLine: 'always', prev: 'class', next: 'class' },

        { blankLine: 'always', prev: 'class', next: 'const' },
        { blankLine: 'always', prev: 'const', next: 'class' },

        { blankLine: 'always', prev: 'class', next: 'multiline-block-like' },
        { blankLine: 'always', prev: 'multiline-block-like', next: 'class' },
        { blankLine: 'always', prev: 'class', next: 'class' },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      'lines-between-class-members': [
        'warn',
        {
          enforce: [
            { blankLine: 'always', prev: 'method', next: 'method' },
            { blankLine: 'always', prev: 'method', next: 'field' },
            { blankLine: 'always', prev: 'field', next: 'method' },
            { blankLine: 'never', prev: 'field', next: 'field' },
          ],
        },
        { exceptAfterSingleLine: false },
      ],
    },
  },
  {
    files: ['**/*.entity.ts'],
    rules: {
      'lines-between-class-members': [
        'warn',
        {
          enforce: [{ blankLine: 'always', prev: '*', next: '*' }],
        },
        { exceptAfterSingleLine: false },
      ],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
  },
];
