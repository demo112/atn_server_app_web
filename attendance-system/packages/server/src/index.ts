console.log('DEBUG: Starting index.ts');
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));

import 'reflect-metadata';
import 'dotenv/config';
import { app } from './app';
import { logger } from './common/logger';

logger.info('Starting server initialization...');

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0';

logger.info({ port: PORT, host: HOST }, 'Attempting to listen on port...');

// Keep process alive hack
setInterval(() => {}, 1000 * 60 * 60);

const server = app.listen(PORT, HOST, () => {
  console.log(`[Startup] Server started on http://${HOST}:${PORT}`);
  logger.info({ port: PORT, env: process.env.NODE_ENV }, 'Server started');
});

server.on('error', (err) => {
  console.error('[Startup] Server listen error:', err);
  logger.error({ err }, 'Server listen error');
  process.exit(1);
});
