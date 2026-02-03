import rootConfig from '../../eslint.config.mjs';
import pluginReact from 'eslint-plugin-react';
import pluginReactNative from 'eslint-plugin-react-native';
import globals from 'globals';

export default [
  ...rootConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
      'react-native': pluginReactNative,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': 'off',
      
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['.expo', 'node_modules', 'babel.config.js', 'metro.config.js']
  }
];
