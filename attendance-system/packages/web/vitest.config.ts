import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@attendance/shared': path.resolve(__dirname, '../shared/src/index.ts'),
      react: path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      'react/jsx-dev-runtime': path.resolve(__dirname, '../../node_modules/react/jsx-dev-runtime.js'),
      'react/jsx-runtime': path.resolve(__dirname, '../../node_modules/react/jsx-runtime.js'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: process.env.TEST_MODE === 'pbt'
      ? ['src/**/*.pbt.test.ts', 'src/**/*.property.test.ts', 'src/**/*.prop.test.ts']
      : ['src/**/*.test.{ts,tsx}', 'src/**/*.property.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    server: {
      deps: {
        inline: [],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    css: false,
  },
});
