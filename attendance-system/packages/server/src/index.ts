console.log('[DEBUG] Starting index.ts');

// Add global error handlers FIRST
process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection:', reason);
});

import 'dotenv/config';
import { app } from './app';
import { logger } from './common/logger';

console.log('[DEBUG] Imports done');

logger.info('Starting server initialization...');

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0';

logger.info({ port: PORT, host: HOST }, 'Attempting to listen on port...');

const server = app.listen(PORT, HOST, () => {
  console.log(`[Startup] Server started on http://${HOST}:${PORT}`);
  logger.info({ port: PORT, env: process.env.NODE_ENV }, 'Server started');
});

server.on('error', (err) => {
  console.error('[Startup] Server listen error:', err);
  logger.error({ err }, 'Server listen error');
  process.exit(1);
});
