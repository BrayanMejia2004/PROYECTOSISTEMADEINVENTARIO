import bcrypt from 'bcryptjs';
import User from '../../shared/models/user/user.model';
import Branch from '../../shared/models/branch/branch.model';
import Tenant from '../../shared/models/tenant/tenant.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { AuditLog } from '../../shared/models/auditLog/auditLog.model';

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

export const createUser = async (input: CreateUserInput, auditUserId?: string) => {
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

  const hashedPassword = await bcrypt.hash(input.password, 12);
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

  AuditLog.create({
    tenantId: input.tenantId,
    userId: auditUserId,
    action: 'create',
    entity: 'user',
    entityId: user._id.toString(),
    details: { email: input.email, role: input.role, branchId: input.branchId },
  }).catch(() => {});

  return user.toObject({ virtuals: false, versionKey: false, transform: (doc, ret: any) => { delete ret.password; return ret; } });
};

const ROLE_HIERARCHY: Record<string, number> = { cashier: 0, admin: 1, owner: 2 };

export const updateUser = async (userId: string, tenantId: string, input: UpdateUserInput, requestingUserRole?: string, auditUserId?: string) => {
  const user = await User.findOne({ _id: userId, tenantId });
  if (!user) throw ApiError.notFound('User not found');

  if (requestingUserRole && ROLE_HIERARCHY[requestingUserRole] <= ROLE_HIERARCHY[user.role]) {
    throw ApiError.forbidden('No puedes modificar un usuario con un rol igual o superior al tuyo');
  }

  if (input.email && input.email !== user.email) {
    const existingUser = await User.findOne({ tenantId, email: input.email });
    if (existingUser) throw ApiError.conflict('Email already exists in this tenant');
  }

  if (input.branchId) {
    const branch = await Branch.findOne({ _id: input.branchId, tenantId });
    if (!branch) throw ApiError.notFound('Branch not found');
  }

  const changes: string[] = [];
  if (input.password) {
    input.password = await bcrypt.hash(input.password, 12);
    changes.push('password');
  }
  if (input.role !== undefined && input.role !== user.role) changes.push(`role: ${user.role} → ${input.role}`);
  if (input.isActive !== undefined && input.isActive !== user.isActive) changes.push(`isActive: ${user.isActive} → ${input.isActive}`);
  if (input.email && input.email !== user.email) changes.push(`email: ${user.email} → ${input.email}`);

  if (input.password || input.role !== undefined || input.isActive !== undefined) {
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  }

  Object.assign(user, input);
  await user.save();

  if (changes.length > 0) {
    AuditLog.create({
      tenantId,
      userId: auditUserId,
      action: 'update',
      entity: 'user',
      entityId: userId,
      details: { changes },
    }).catch(() => {});
  }

  return user.toObject({ virtuals: false, versionKey: false, transform: (doc, ret: any) => { delete ret.password; return ret; } });
};

export const deleteUser = async (userId: string, tenantId: string, requestingUserRole?: string, auditUserId?: string) => {
  const user = await User.findOne({ _id: userId, tenantId });
  if (!user) throw ApiError.notFound('User not found');

  if (requestingUserRole && ROLE_HIERARCHY[requestingUserRole] <= ROLE_HIERARCHY[user.role]) {
    throw ApiError.forbidden('No puedes eliminar un usuario con un rol igual o superior al tuyo');
  }

  await User.findOneAndDelete({ _id: userId, tenantId });

  AuditLog.create({
    tenantId,
    userId: auditUserId,
    action: 'delete',
    entity: 'user',
    entityId: userId,
    details: { email: user.email, role: user.role },
  }).catch(() => {});

  return user;
};
