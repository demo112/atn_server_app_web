/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function getServerPort() {
  try {
    const envPath = path.resolve(__dirname, '../server/.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/^PORT=(\d+)/m);
      if (match) return parseInt(match[1], 10);
    }
  } catch (e) {
    console.warn('Failed to load server .env, using default port 3001');
  }
  return 3001;
}

const SERVER_PORT = getServerPort();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@attendance/shared/src': path.resolve(__dirname, '../shared/src'),
      '@attendance/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    }
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${SERVER_PORT}`,
        changeOrigin: true
      }
    }
  },
  test: {
    env: {
      SERVER_PORT: SERVER_PORT.toString()
    },
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: `http://localhost:${SERVER_PORT}`,
      },
    },
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    server: {
      deps: {
        inline: [],
      },
    },
  }
})
