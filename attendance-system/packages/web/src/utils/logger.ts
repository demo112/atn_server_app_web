/* eslint-disable no-console */
export const logger = {
  info: (...args: unknown[]) => {
    if (import.meta.env.MODE === 'development') {
      console.log('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
  debug: (...args: unknown[]) => {
    if (import.meta.env.MODE === 'development') {
      console.debug('[DEBUG]', ...args);
    }
  }
};
