import 'dotenv/config';
import { app } from './app';
import { logger } from './common/logger';

logger.info('Starting server initialization...');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV }, 'Server started');
});

process.on('exit', (code) => {
  logger.info(`Process exiting with code ${code}`);
});

process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught Exception');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
});
