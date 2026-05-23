import Tenant from '../../shared/models/tenant/tenant.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';

interface UpdateTenantSettingsInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  nit?: string;
}

export const getTenantSettings = async (tenantId: string) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw ApiError.notFound('Tenant not found');
  return tenant;
};

export const updateTenantSettings = async (tenantId: string, input: UpdateTenantSettingsInput) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw ApiError.notFound('Tenant not found');

  Object.assign(tenant, input);
  await tenant.save();
  return tenant;
};
