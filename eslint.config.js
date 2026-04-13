import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import boundaries from 'eslint-plugin-boundaries';
import security from 'eslint-plugin-security';
import noSecrets from 'eslint-plugin-no-secrets';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // 1. Base JS recommended
  js.configs.recommended,

  // 2. TypeScript strict — R5
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // 3. Main source config
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      boundaries,
      security,
      'no-secrets': noSecrets,
    },
    settings: {
      react: { version: 'detect' },
      // FSD boundary zones — R4
      'boundaries/elements': [
        { type: 'app',      pattern: 'src/app/*' },
        { type: 'pages',    pattern: 'src/pages/*' },
        { type: 'widgets',  pattern: 'src/widgets/*' },
        { type: 'features', pattern: 'src/features/*' },
        { type: 'entities', pattern: 'src/entities/*' },
        { type: 'shared',   pattern: 'src/shared/*' },
      ],
      'boundaries/ignore': ['src/test/**'],
    },
    rules: {
      // React
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // R3 — Zero inline styles
      'react/forbid-component-props': ['error', { forbid: ['style'] }],
      'react/forbid-dom-props': ['error', { forbid: ['style'] }],

      // R4 — FSD import boundaries
      // NOTE: `element-types` is deprecated in eslint-plugin-boundaries v6 (renamed to
      // `dependencies`), but the v6 `dependencies` rule has a breaking API change.
      // Keeping `element-types` until we update to the new selector syntax.
      // The "[boundaries][warning]" console lines are plugin stdout, not ESLint warnings.
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: 'app',      allow: ['pages', 'widgets', 'features', 'entities', 'shared'] },
          { from: 'pages',    allow: ['widgets', 'features', 'entities', 'shared'] },
          { from: 'widgets',  allow: ['features', 'entities', 'shared'] },
          { from: 'features', allow: ['entities', 'shared'] },
          { from: 'entities', allow: ['shared'] },
          { from: 'shared',   allow: [] },
        ],
      }],

      // Security — R6, Section 5.2
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-eval-with-expression': 'error',

      // No hardcoded secrets
      'no-secrets/no-secrets': 'error',

      // No console.log (only console.error allowed)
      'no-console': ['warn', { allow: ['error'] }],

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },

  // 4. Vitest test files — relax some rules
  {
    files: ['src/test/**', 'src/**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-secrets/no-secrets': 'off',
    },
  },

  // 5. Prettier LAST — disables formatting conflicts
  prettierConfig,

  // 6. Ignore patterns
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
);
