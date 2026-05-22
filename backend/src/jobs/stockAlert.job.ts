import cron from 'node-cron';
import { getLowStockAlerts } from '../services/stock.service';
import { logger } from '../config/logger';
import Tenant from '../models/tenant.model';

export const startStockAlertJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running stock alert check...');
      const tenants = await Tenant.find({ isActive: true });

      for (const tenant of tenants) {
        const alerts = await getLowStockAlerts(tenant._id.toString());
        if (alerts.data.length > 0) {
          logger.warn(`Tenant ${tenant.slug}: ${alerts.data.length} products with low stock`);
        }
      }

      logger.info('Stock alert check completed');
    } catch (error) {
      logger.error('Error in stock alert job:', error);
    }
  });

  logger.info('Stock alert job scheduled to run every hour');
};
