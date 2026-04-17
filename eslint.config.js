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

      // R4 — FSD import boundaries (eslint-plugin-boundaries v6 API)
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        rules: [
          { from: { type: 'app' },      allow: { to: { type: ['pages', 'widgets', 'features', 'entities', 'shared'] } } },
          { from: { type: 'pages' },    allow: { to: { type: ['widgets', 'features', 'entities', 'shared'] } } },
          { from: { type: 'widgets' },  allow: { to: { type: ['features', 'entities', 'shared'] } } },
          { from: { type: 'features' }, allow: { to: { type: ['entities', 'shared'] } } },
          { from: { type: 'entities' }, allow: { to: { type: ['shared'] } } },
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

  // 4b. React Three Fiber files — disable react/no-unknown-property.
  // R3F extends the JSX namespace with Three.js element types (mesh, sphereGeometry, etc.)
  // and their props (position, args, roughness, emissive, …). The React ESLint plugin has
  // no knowledge of these custom elements, so the rule produces only false positives here.
  {
    files: ['src/**/ThreeCompanions.tsx', 'src/**/CompanionAvatar.tsx'],
    rules: {
      'react/no-unknown-property': 'off',
    },
  },

  // 5. Prettier LAST — disables formatting conflicts
  prettierConfig,

  // 6. Ignore patterns
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
);
