import { AuditLog } from '../../models/auditLog/auditLog.model';
import { logger } from '../../../config/logger/logger';

interface AuditConfig {
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  entity: string;
  getTenantId: (...args: any[]) => string;
  getUserId?: (...args: any[]) => string | undefined;
  getEntityId?: (...args: any[]) => string | undefined;
  getDetails?: (...args: any[]) => Record<string, any> | undefined;
}

export function withAudit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: AuditConfig
): T {
  const wrapped = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const result = await fn(...args);

    try {
      const tenantId = config.getTenantId(...args);
      const userId = config.getUserId?.(...args);
      const entityId = config.getEntityId?.(...args);
      const details = config.getDetails?.(...args);

      await AuditLog.create({
        tenantId,
        userId: userId || undefined,
        action: config.action,
        entity: config.entity,
        entityId: entityId || undefined,
        details: details || undefined,
      });
    } catch (error) {
      logger.warn(`Fallo al registrar auditoría: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  };

  return wrapped as T;
}
