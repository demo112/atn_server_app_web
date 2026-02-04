import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: process.env.TEST_MODE === 'pbt' 
      ? ['src/**/*.pbt.test.ts', 'src/**/*.property.test.ts', 'src/**/*.prop.test.ts']
      : ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.property.test.ts', 'src/**/*.pbt.test.ts', 'src/**/*.prop.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    exclude: process.env.TEST_MODE === 'pbt' ? ['**/*.tsx', '**/*.jsx'] : [],
    alias: {
      'react-native': 'react-native-web',
    },
    define: {
      __DEV__: true,
    },
    // Mock react-native modules if needed
  },
});
