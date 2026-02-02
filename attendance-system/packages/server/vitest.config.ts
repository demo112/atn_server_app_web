
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.integration.test.ts', 'src/**/*.verification.test.ts'],
    alias: {
      '@attendance/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});
