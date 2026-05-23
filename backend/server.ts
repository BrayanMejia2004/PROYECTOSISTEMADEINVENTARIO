import app from './src/app';
import { connectDB } from './src/config/database/database';
import { env } from './src/config/env/env';
import { logger } from './src/config/logger/logger';
import { startStockAlertJob } from './src/jobs/stockAlert/stockAlert.job';

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    logger.info(`📦 Environment: ${env.NODE_ENV}`);
    startStockAlertJob();
  });
};

startServer().catch((error) => {
  logger.error('❌ Failed to start server:', error);
  process.exit(1);
});
