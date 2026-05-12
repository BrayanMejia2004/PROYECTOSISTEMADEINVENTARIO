import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt';
import Tenant from '../models/tenant.model';
import User from '../models/user.model';
import { ApiError } from '../utils/ApiError';

interface RegisterTenantInput {
  tenantName: string;
  tenantSlug: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginInput {
  email: string;
  password: string;
  tenantSlug: string;
}

export const registerTenant = async (input: RegisterTenantInput) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingTenant = await Tenant.findOne({ slug: input.tenantSlug }).session(session);
    if (existingTenant) {
      throw ApiError.conflict('Tenant slug already exists');
    }

    const tenant = new Tenant({
      slug: input.tenantSlug,
      name: input.tenantName,
      email: input.email,
    });
    await tenant.save({ session });

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = new User({
      tenantId: tenant._id.toString(),
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      role: 'owner',
      isActive: true,
    });
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    const token = signToken({
      userId: user._id.toString(),
      tenantId: tenant._id.toString(),
      role: user.role,
    });

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tenant: {
        id: tenant._id.toString(),
        name: tenant.name,
        slug: tenant.slug,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const login = async (input: LoginInput) => {
  const tenant = await Tenant.findOne({ slug: input.tenantSlug });
  if (!tenant || !tenant.isActive) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const user = await User.findOne({ tenantId: tenant._id.toString(), email: input.email })
    .select('+password');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const token = signToken({
    userId: user._id.toString(),
    tenantId: tenant._id.toString(),
    role: user.role,
    branchId: user.branchId,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      branchId: user.branchId,
    },
    tenant: {
      id: tenant._id.toString(),
      name: tenant.name,
      slug: tenant.slug,
    },
  };
};

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  const tenant = await Tenant.findById(user.tenantId);
  return { user, tenant };
};
