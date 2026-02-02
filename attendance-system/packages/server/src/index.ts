console.log('Starting server initialization...');
import dotenv from 'dotenv';
import { app } from './app';
import { logger } from './common/logger';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
