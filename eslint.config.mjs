import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier' // Import officiel
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  // 1. Ignorer les dossiers de build
  {
    ignores: ['**/node_modules', '**/dist', '**/out', 'src/generated']
  },

  // 2. Base recommandées JS et TS
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Configuration spécifique React
  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      // Protection MariaSaaS
      'no-console': ['error', { allow: ['warn', 'error'] }]
    }
  },

  // 4. Désactiver les conflits de style Prettier (Objet pur, sans "extends")
  eslintConfigPrettier
)