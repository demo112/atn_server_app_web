import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';

// Startup logger
const logPath = path.join(process.cwd(), 'startup.log');
const log = (msg: string) => {
  const time = new Date().toISOString();
  try {
    fs.appendFileSync(logPath, `[${time}] ${msg}\n`);
  } catch (e) {
    // Ignore log write errors
  }
  process.stdout.write(msg + '\n');
};

// Hook console.log and console.error to file log
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
  log(`[CONSOLE] ${msg}`);
};

console.error = (...args) => {
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
  log(`[ERROR] ${msg}`);
};

log('DEBUG: Index.ts loaded - Starting application');

try {
  log('Importing dotenv/config...');
  // Force load .env from project root or server root
  const envResult = require('dotenv').config({ path: path.join(process.cwd(), '.env'), override: true });
  if (envResult.error) {
    log(`dotenv error: ${envResult.error.message}`);
  } else {
    log('dotenv loaded successfully');
  }
  
  log(`PORT from env: ${process.env.PORT}`);

  log('Importing app...');
  const { app } = require('./app');
  log('app imported');

  log('Importing logger...');
  const { logger } = require('./common/logger');
  log('logger imported');

  log('Initializing server configuration...');
  const PORT = process.env.PORT || 3001;

  log(`Calling app.listen on port ${PORT}...`);
  const server = app.listen(PORT, '0.0.0.0', () => {
    const msg = `[Startup] Server started on http://0.0.0.0:${PORT}`;
    log(msg);
    logger.info(msg);
  });
  log('app.listen returned server instance');

  server.on('error', (e: any) => {
    log(`SERVER ERROR: ${e.message}`);
    if (e.code === 'EADDRINUSE') {
      log(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  // Handle graceful shutdown
  const shutdown = () => {
    log('Received shutdown signal');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // PREVENT PREMATURE EXIT: Keep event loop alive
  setInterval(() => {
    // No-op to keep process running if event loop empties
  }, 60000);

} catch (error: any) {
  log(`CRITICAL ERROR: ${error.message}`);
  console.error(error);
  process.exit(1);
}
