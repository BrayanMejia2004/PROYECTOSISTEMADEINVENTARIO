import { eventBus } from '../EventBus';
import { Events, SaleCreatedEvent, SaleRefundedEvent } from '../events';
import { recordPurchase } from '../../../../modules/customer/customer.service';
import { AuditLog } from '../../../models/auditLog/auditLog.model';
import { logger } from '../../../../config/logger/logger';

export const registerSaleListeners = () => {
  eventBus.on<SaleCreatedEvent>(Events.SALE_CREATED, async (event) => {
    if (event.customerId) {
      try {
        await recordPurchase(event.customerId, event.tenantId, event.total);
      } catch (error) {
        logger.warn(`Fallo en el listener de registro de compra: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    try {
      await AuditLog.create({
        tenantId: event.tenantId,
        userId: event.userId,
        action: 'create',
        entity: 'Sale',
        entityId: event.saleId,
        details: { saleNumber: event.saleNumber, total: event.total, paymentMethod: event.paymentMethod },
      });
    } catch (error) {
      logger.warn(`Fallo en el listener de auditoría de venta creada: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  eventBus.on<SaleRefundedEvent>(Events.SALE_REFUNDED, async (event) => {
    try {
      await AuditLog.create({
        tenantId: event.tenantId,
        action: 'update',
        entity: 'Sale',
        entityId: event.saleId,
        details: { saleNumber: event.saleNumber, status: 'refunded', total: event.total },
      });
    } catch (error) {
      logger.warn(`Fallo en el listener de auditoría de venta reembolsada: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
};
