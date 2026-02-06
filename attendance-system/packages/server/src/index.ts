import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';

// Startup logger
const logPath = path.join(process.cwd(), 'startup.log');
const log = (msg: string) => {
  const time = new Date().toISOString();
  try {
    fs.appendFileSync(logPath, `[${time}] ${msg}\n`);
  } catch (e) {
    console.error('Failed to write to log file:', e);
  }
  console.log(msg);
};

log('DEBUG: Index.ts loaded - Starting application');

try {
  log('Importing dotenv/config...');
  require('dotenv/config');
  log('dotenv imported');

  log('Importing app...');
  const { app } = require('./app');
  log('app imported');

  log('Importing logger...');
  const { logger } = require('./common/logger');
  log('logger imported');

  process.on('uncaughtException', (err) => {
    log(`Uncaught Exception: ${err.message}\n${err.stack}`);
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    log(`Unhandled Rejection: ${reason}`);
    console.error('Unhandled Rejection:', reason);
  });

  logger.info('Starting server initialization...');
  log('Initializing server configuration...');

  // Enforce PORT 3000 as per project rules
  if (process.env.PORT && process.env.PORT !== '3000') {
    log(`WARNING: PORT in .env is ${process.env.PORT}, but enforcing 3000 per project rules.`);
  }
  const PORT = 3000;
  const HOST = '0.0.0.0';

  log(`Configuration: PORT=${PORT}, HOST=${HOST}`);
  logger.info({ port: PORT, host: HOST }, 'Attempting to listen on port...');

  // Keep process alive hack
  setInterval(() => {
    // Heartbeat
  }, 1000 * 60);

  const server = app.listen(PORT, HOST, () => {
    log(`[Startup] Server started on http://${HOST}:${PORT}`);
    console.log(`[Startup] Server started on http://${HOST}:${PORT}`);
    logger.info({ port: PORT, env: process.env.NODE_ENV }, 'Server started');
  });

  server.on('error', (err: any) => {
    log(`[Startup] Server listen error: ${err.message}`);
    console.error('[Startup] Server listen error:', err);
    logger.error({ err }, 'Server listen error');
    process.exit(1);
  });

} catch (error: any) {
  log(`CRITICAL ERROR during startup: ${error.message}\n${error.stack}`);
  console.error('CRITICAL ERROR:', error);
  process.exit(1);
}
