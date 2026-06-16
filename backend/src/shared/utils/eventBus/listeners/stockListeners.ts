import { logger } from '../../../../config/logger/logger';
import { eventBus } from '../EventBus';
import { Events, StockMovedEvent } from '../events';

export const registerStockListeners = () => {
  eventBus.on<StockMovedEvent>(Events.STOCK_MOVED, async (event) => {
    if (event.type === 'sale' && event.newQuantity <= 0) {
      logger.warn(
        `[Stock Alert] Product ${event.productId} en sucursal ${event.branchId} está agotado (tenant: ${event.tenantId})`
      );
    }
  });
};
