import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

import reactHooksPlugin from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  reactHooksPlugin.configs['recommended-latest'],
  {
    ignores: ['packages/*/dist'],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      curly: ['warn'],
      'no-empty': 'off',
      'no-fallthrough': 'off',
      'no-async-promise-executor': 'off',
      'no-useless-catch': 'off',

      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',

      'import/no-unresolved': 'off',
      'import/no-named-as-default': 'off',
      'import/order': [
        'warn',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          },
          named: {
	    enabled: true,
            types: "types-last"
          },
          pathGroups: [
            {
              pattern: '~/**',
              group: 'external',
              position: 'after'
            }
          ],
          'newlines-between': 'always'
        }
      ],

      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/no-unescaped-entities': 'off'
    }
  }
)
