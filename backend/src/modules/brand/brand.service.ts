import Brand from '../../shared/models/brand/brand.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';

interface CreateBrandInput {
  tenantId: string;
  branchId?: string;
  name: string;
}

interface UpdateBrandInput {
  name?: string;
  isActive?: boolean;
}

export const getBrands = async (tenantId: string, branchId?: string, options?: { page?: number; limit?: number }) => {
  const { page = 1, limit = 10 } = options || {};
  const query: any = { tenantId };
  if (branchId) {
    query.$or = [
      { branchId },
      { branchId: { $exists: false } },
    ];
  }
  const [total, brands] = await Promise.all([
    Brand.countDocuments(query),
    Brand.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
  ]);
  return { data: brands, meta: { total, page, limit } };
};

export const getBrandById = async (brandId: string, tenantId: string, branchId?: string) => {
  const query: any = { _id: brandId, tenantId };
  if (branchId) {
    query.$or = [
      { branchId },
      { branchId: { $exists: false } },
    ];
  }
  const brand = await Brand.findOne(query);
  if (!brand) throw ApiError.notFound('Brand not found');
  return brand;
};

export const createBrand = async (input: CreateBrandInput) => {
  const brand = new Brand({
    tenantId: input.tenantId,
    branchId: input.branchId,
    name: input.name,
  });
  await brand.save();
  return brand;
};

export const updateBrand = async (brandId: string, tenantId: string, branchId: string | undefined, input: UpdateBrandInput) => {
  const query: any = { _id: brandId, tenantId };
  if (branchId) {
    query.$or = [
      { branchId },
      { branchId: { $exists: false } },
    ];
  }
  const brand = await Brand.findOne(query);
  if (!brand) throw ApiError.notFound('Brand not found');
  Object.assign(brand, input);
  await brand.save();
  return brand;
};

export const deleteBrand = async (brandId: string, tenantId: string, branchId?: string) => {
  const query: any = { _id: brandId, tenantId };
  if (branchId) {
    query.$or = [
      { branchId },
      { branchId: { $exists: false } },
    ];
  }
  const brand = await Brand.findOneAndDelete(query);
  if (!brand) throw ApiError.notFound('Brand not found');
  return brand;
};
