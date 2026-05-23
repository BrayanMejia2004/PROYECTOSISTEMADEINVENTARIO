import bcrypt from 'bcryptjs';
import User from '../../shared/models/user/user.model';
import Branch from '../../shared/models/branch/branch.model';
import Tenant from '../../shared/models/tenant/tenant.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';

interface CreateUserInput {
  tenantId: string;
  branchId?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'cashier' | 'admin' | 'owner';
}

interface UpdateUserInput {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: 'cashier' | 'admin' | 'owner';
  branchId?: string;
  isActive?: boolean;
}

export const getUsers = async (tenantId: string, role?: string, branchId?: string, options?: { page?: number; limit?: number }) => {
  const { page = 1, limit = 10 } = options || {};
  const query: any = { tenantId };
  if (role) query.role = role;
  if (branchId) query.branchId = branchId;
  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
  ]);
  return { data: users, meta: { total, page, limit } };
};

export const getUserById = async (userId: string, tenantId: string) => {
  const user = await User.findOne({ _id: userId, tenantId }).select('-password');
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const createUser = async (input: CreateUserInput) => {
  const tenant = await Tenant.findById(input.tenantId);
  if (!tenant) throw ApiError.notFound('Tenant not found');

  const existingUser = await User.findOne({ tenantId: input.tenantId, email: input.email });
  if (existingUser) {
    throw ApiError.conflict('Email already exists in this tenant');
  }

  if (input.branchId) {
    const branch = await Branch.findOne({ _id: input.branchId, tenantId: input.tenantId });
    if (!branch) throw ApiError.notFound('Branch not found');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const user = new User({
    tenantId: input.tenantId,
    branchId: input.branchId,
    email: input.email,
    password: hashedPassword,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role,
    isActive: true,
  });

  await user.save();
  return user.toObject({ virtuals: false, versionKey: false, transform: (doc, ret: any) => { delete ret.password; return ret; } });
};

export const updateUser = async (userId: string, tenantId: string, input: UpdateUserInput) => {
  const user = await User.findOne({ _id: userId, tenantId });
  if (!user) throw ApiError.notFound('User not found');

  if (input.email && input.email !== user.email) {
    const existingUser = await User.findOne({ tenantId, email: input.email });
    if (existingUser) throw ApiError.conflict('Email already exists in this tenant');
  }

  if (input.branchId) {
    const branch = await Branch.findOne({ _id: input.branchId, tenantId });
    if (!branch) throw ApiError.notFound('Branch not found');
  }

  if (input.password) {
    input.password = await bcrypt.hash(input.password, 10);
  }

  Object.assign(user, input);
  await user.save();

  return user.toObject({ virtuals: false, versionKey: false, transform: (doc, ret: any) => { delete ret.password; return ret; } });
};

export const deleteUser = async (userId: string, tenantId: string) => {
  const user = await User.findOneAndDelete({ _id: userId, tenantId });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};
