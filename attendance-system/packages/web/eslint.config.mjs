import rootConfig from '../../eslint.config.mjs';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  ...rootConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Web 端允许 warn 级别的 console
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: ['dist', 'coverage', '.eslintrc.cjs']
  }
];
