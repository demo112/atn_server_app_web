import 'dotenv/config';
import { app } from './app';
import { logger } from './common/logger';

// Add global error handlers first
process.on('exit', (code) => {
  console.log(`[Process] Process exiting with code ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
  logger.error(err, 'Uncaught Exception');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection:', reason);
  logger.error({ reason, promise }, 'Unhandled Rejection');
});

console.log('[Startup] Starting server initialization...');
logger.info('Starting server initialization...');

const PORT = process.env.PORT || 3000;
console.log(`[Startup] Attempting to listen on port ${PORT}...`);

const server = app.listen(PORT, () => {
  console.log(`[Startup] Server started on port ${PORT}`);
  logger.info({ port: PORT, env: process.env.NODE_ENV }, 'Server started');
});

server.on('error', (err) => {
  console.error('[Startup] Server listen error:', err);
  logger.error({ err }, 'Server listen error');
  process.exit(1);
});
