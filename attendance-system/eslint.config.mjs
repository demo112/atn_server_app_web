import tseslint from 'typescript-eslint';
import globals from "globals";
import pluginJs from "@eslint/js";

export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.expo/**', '**/.trae/**', '**/.docusaurus/**', '**/coverage/**'],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // 类型安全
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { "argsIgnorePattern": "^_" }],
      
      // 代码质量
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      
      // 存量代码豁免（逐步收紧）
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
  {
    files: ['scripts/**/*.js', 'scripts/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    }
  },
  {
    files: ['**/*.config.js', '**/*.config.cjs', '**/verify-comments.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    }
  }
);
