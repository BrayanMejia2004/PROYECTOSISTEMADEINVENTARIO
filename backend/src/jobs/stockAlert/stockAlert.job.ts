import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { getLowStockAlerts } from '../../modules/stock/stock.service';
import { logger } from '../../config/logger/logger';
import Tenant from '../../shared/models/tenant/tenant.model';

export const startStockAlertJob = (): ScheduledTask => {
  const task = cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Ejecutando verificación de alertas de stock...');
      const tenants = await Tenant.find({ isActive: true });

      let processedCount = 0;
      let alertCount = 0;

      for (const tenant of tenants) {
        try {
          const alerts = await getLowStockAlerts(tenant._id.toString());
          if (alerts.data.length > 0) {
            logger.warn(`Tenant ${tenant.slug}: ${alerts.data.length} productos con stock bajo`);
            alertCount += alerts.data.length;
          }
          processedCount++;
        } catch (error) {
          logger.error(`Error al verificar alertas de stock para el tenant ${tenant.slug} (${tenant._id}): ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      logger.info(`Verificación de alertas de stock completada: ${processedCount}/${tenants.length} tenants procesados, ${alertCount} alerta(s) encontrada(s)`);
    } catch (error) {
      logger.error(`Error en el job de alertas de stock al obtener tenants: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  logger.info('Job de alertas de stock programado para ejecutarse cada hora');
  return task;
};
