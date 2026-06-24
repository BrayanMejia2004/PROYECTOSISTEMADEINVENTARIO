import { eventBus } from '../EventBus';
import { Events, UserLoginEvent, UserLogoutEvent } from '../events';
import { AuditLog } from '../../../models/auditLog/auditLog.model';
import { logger } from '../../../../config/logger/logger';

export const registerAuthListeners = () => {
  eventBus.on<UserLoginEvent>(Events.USER_LOGIN, async (event) => {
    try {
      await AuditLog.create({
        tenantId: event.tenantId,
        userId: event.userId,
        action: 'login',
        entity: 'User',
        entityId: event.userId,
        details: { ip: event.ip },
      });
    } catch (error) {
      logger.warn(`Fallo en el listener de inicio de sesión: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  eventBus.on<UserLogoutEvent>(Events.USER_LOGOUT, async (event) => {
    try {
      await AuditLog.create({
        tenantId: event.tenantId,
        userId: event.userId,
        action: 'logout',
        entity: 'User',
        entityId: event.userId,
      });
    } catch (error) {
      logger.warn(`Fallo en el listener de cierre de sesión: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
};
