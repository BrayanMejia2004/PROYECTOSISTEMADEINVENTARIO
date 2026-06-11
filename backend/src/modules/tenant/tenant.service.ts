import Tenant from '../../shared/models/tenant/tenant.model';
import cloudinary from '../../config/cloudinary/cloudinary';
import { ApiError } from '../../shared/utils/apiError/ApiError';

interface UpdateTenantSettingsInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  nit?: string;
  brandColor?: string;
  brandColorLight?: string;
  brandColorDark?: string;
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

export const uploadLogo = async (tenantId: string, file: Express.Multer.File) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw ApiError.notFound('Tenant not found');

  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `tenant-${tenantId}/logo`, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });

  tenant.logo = result.secure_url;
  await tenant.save();
  return tenant;
};
