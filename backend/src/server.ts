import app from './app';
import { connectDB } from './config/database/database';
import { env } from './config/env/env';
import { logger } from './config/logger/logger';
import { startStockAlertJob } from './jobs/stockAlert/stockAlert.job';
import { registerSaleListeners, registerStockListeners, registerAuthListeners } from './shared/utils/eventBus';

const startServer = async (): Promise<void> => {
  await connectDB();
  registerSaleListeners();
  registerStockListeners();
  registerAuthListeners();
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
