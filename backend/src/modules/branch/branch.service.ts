import Branch from '../../shared/models/branch/branch.model';
import Tenant from '../../shared/models/tenant/tenant.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';

interface CreateBranchInput {
  tenantId: string;
  name: string;
  address?: string;
  phone?: string;
}

interface UpdateBranchInput {
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export const getBranches = async (tenantId: string) => {
  const branches = await Branch.find({ tenantId }).sort({ createdAt: -1 });
  return branches;
};

export const getBranchById = async (branchId: string, tenantId: string) => {
  const branch = await Branch.findOne({ _id: branchId, tenantId });
  if (!branch) throw ApiError.notFound('Branch not found');
  return branch;
};

export const createBranch = async (input: CreateBranchInput) => {
  const branch = new Branch({
    tenantId: input.tenantId,
    name: input.name,
    address: input.address,
    phone: input.phone,
    isActive: true,
  });

  await branch.save();
  return branch;
};

export const updateBranch = async (branchId: string, tenantId: string, input: UpdateBranchInput) => {
  const branch = await Branch.findOne({ _id: branchId, tenantId });
  if (!branch) throw ApiError.notFound('Branch not found');

  Object.assign(branch, input);
  await branch.save();
  return branch;
};

export const deleteBranch = async (branchId: string, tenantId: string) => {
  const branch = await Branch.findOneAndDelete({ _id: branchId, tenantId });
  if (!branch) throw ApiError.notFound('Branch not found');
  return branch;
};
