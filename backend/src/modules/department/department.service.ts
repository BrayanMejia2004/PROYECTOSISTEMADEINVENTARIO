import Department from '../../shared/models/department/department.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';

interface CreateDepartmentInput {
  tenantId: string;
  branchId?: string;
  name: string;
  parentId?: string;
}

interface UpdateDepartmentInput {
  name?: string;
  parentId?: string;
  isActive?: boolean;
}

export const getDepartments = async (tenantId: string, branchId?: string, options?: { page?: number; limit?: number }) => {
  const { page = 1, limit = 10 } = options || {};
  const query: any = { tenantId };
  if (branchId) {
    query.$or = [
      { branchId },
      { branchId: { $exists: false } },
    ];
  }
  const [total, departments] = await Promise.all([
    Department.countDocuments(query),
    Department.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
  ]);
  return { data: departments, meta: { total, page, limit } };
};

export const getDepartmentById = async (departmentId: string, tenantId: string, branchId?: string) => {
  const query: any = { _id: departmentId, tenantId };
  if (branchId) {
    query.$or = [
      { branchId },
      { branchId: { $exists: false } },
    ];
  }
  const department = await Department.findOne(query);
  if (!department) throw ApiError.notFound('Department not found');
  return department;
};

export const createDepartment = async (input: CreateDepartmentInput) => {
  if (input.parentId) {
    const parentQuery: any = { _id: input.parentId, tenantId: input.tenantId };
    if (input.branchId) {
      parentQuery.$or = [
        { branchId: input.branchId },
        { branchId: { $exists: false } },
      ];
    }
    const parent = await Department.findOne(parentQuery);
    if (!parent) throw ApiError.notFound('Parent department not found');
  }

  const department = new Department({
    tenantId: input.tenantId,
    branchId: input.branchId,
    name: input.name,
    parentId: input.parentId,
  });

  await department.save();
  return department;
};

export const updateDepartment = async (departmentId: string, tenantId: string, branchId: string | undefined, input: UpdateDepartmentInput) => {
  const query: any = { _id: departmentId, tenantId };
  if (branchId) {
    query.$or = [
      { branchId },
      { branchId: { $exists: false } },
    ];
  }
  const department = await Department.findOne(query);
  if (!department) throw ApiError.notFound('Department not found');

  if (input.parentId) {
    if (input.parentId === departmentId) {
      throw ApiError.badRequest('Department cannot be its own parent');
    }
    const parentQuery: any = { _id: input.parentId, tenantId };
    if (branchId) {
      parentQuery.$or = [
        { branchId },
        { branchId: { $exists: false } },
      ];
    }
    const parent = await Department.findOne(parentQuery);
    if (!parent) throw ApiError.notFound('Parent department not found');
  }

  Object.assign(department, input);
  await department.save();
  return department;
};

export const deleteDepartment = async (departmentId: string, tenantId: string, branchId?: string) => {
  const query: any = { _id: departmentId, tenantId };
  if (branchId) {
    query.$or = [
      { branchId },
      { branchId: { $exists: false } },
    ];
  }
  const department = await Department.findOneAndDelete(query);
  if (!department) throw ApiError.notFound('Department not found');
  return department;
};
