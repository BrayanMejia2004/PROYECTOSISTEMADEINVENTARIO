import { eventBus } from '../EventBus';
import { Events, UserLoginEvent, UserLogoutEvent } from '../events';
import { AuditLog } from '../../../models/auditLog/auditLog.model';

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
    } catch {
      // non-critical side effect
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
    } catch {
      // non-critical side effect
    }
  });
};
