import Supplier from '../../shared/models/supplier/supplier.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';

interface CreateSupplierInput {
  tenantId: string;
  branchId?: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

interface UpdateSupplierInput {
  name?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive?: boolean;
}

export const getSuppliers = async (tenantId: string, branchId?: string, options?: { page?: number; limit?: number }) => {
  const { page = 1, limit = 10 } = options || {};
  const query: any = { tenantId, isActive: true };
  if (branchId) query.branchId = branchId;
  const [total, suppliers] = await Promise.all([
    Supplier.countDocuments(query),
    Supplier.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
  ]);
  return { data: suppliers, meta: { total, page, limit } };
};

export const getSupplierById = async (supplierId: string, tenantId: string, branchId?: string) => {
  const query: any = { _id: supplierId, tenantId };
  if (branchId) query.branchId = branchId;
  const supplier = await Supplier.findOne(query);
  if (!supplier) throw ApiError.notFound('Supplier not found');
  return supplier;
};

export const createSupplier = async (input: CreateSupplierInput) => {
  const supplier = new Supplier(input);
  await supplier.save();
  return supplier;
};

export const updateSupplier = async (supplierId: string, tenantId: string, branchId: string | undefined, input: UpdateSupplierInput) => {
  const query: any = { _id: supplierId, tenantId };
  if (branchId) query.branchId = branchId;
  const supplier = await Supplier.findOne(query);
  if (!supplier) throw ApiError.notFound('Supplier not found');

  Object.assign(supplier, input);
  await supplier.save();
  return supplier;
};

export const deleteSupplier = async (supplierId: string, tenantId: string, branchId?: string) => {
  const query: any = { _id: supplierId, tenantId };
  if (branchId) query.branchId = branchId;
  const supplier = await Supplier.findOneAndDelete(query);
  if (!supplier) throw ApiError.notFound('Supplier not found');
  return supplier;
};
