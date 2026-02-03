import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env: Record<string, string> = {};
  
  if (mode === 'quick') {
    env.FC_NUM_RUNS = '10';
  } else if (mode === 'full') {
    env.FC_NUM_RUNS = '1000';
  } else {
    // Default run, let setup-pbt.ts handle default or use env var if passed manually
    // But for consistency we can set a default here too if we want. 
    // Let's leave it empty so existing FC defaults (100) or manual env vars work.
    // If explicit 'test' mode is passed, we might want 100.
    if (mode === 'test') {
       env.FC_NUM_RUNS = '100';
    }
  }

  return {
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts', 'src/**/*.integration.test.ts', 'src/**/*.verification.test.ts', 'src/**/*.pbt.test.ts'],
      setupFiles: ['./src/common/test/setup-pbt.ts'],
      alias: {
        '@attendance/shared': path.resolve(__dirname, '../shared/src'),
      },
      env,
    },
  };
});
