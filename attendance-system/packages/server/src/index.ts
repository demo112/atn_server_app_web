import 'dotenv/config';
import { app } from './app';
import { logger } from './common/logger';

logger.info('Starting server initialization...');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
