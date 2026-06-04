import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { signToken } from '../../shared/utils/jwt/jwt';
import Tenant from '../../shared/models/tenant/tenant.model';
import User from '../../shared/models/user/user.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';

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

    const hashedPassword = await bcrypt.hash(input.password, 12);
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

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw ApiError.unauthorized(`Cuenta bloqueada. Intenta de nuevo en ${minutesLeft} minuto(s).`);
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) {
    user.loginAttempts = (user.loginAttempts ?? 0) + 1;
    if (user.loginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      user.loginAttempts = 0;
      await user.save();
      throw ApiError.unauthorized('Cuenta bloqueada por 15 minutos tras múltiples intentos fallidos.');
    }
    await user.save();
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockedUntil = null;
    await user.save();
  }

    const token = signToken({
      userId: user._id.toString(),
      tenantId: tenant._id.toString(),
      role: user.role,
      branchId: user.branchId?.toString() ?? undefined,
      tokenVersion: user.tokenVersion ?? 0,
    });

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    branchId: user.branchId?.toString() ?? undefined,
    },
    tenant: {
      id: tenant._id.toString(),
      name: tenant.name,
      slug: tenant.slug,
    },
  };
};

export const getProfile = async (userId: string, tenantId: string) => {
  const user = await User.findOne({ _id: userId, tenantId }).select('-password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  const tenant = await Tenant.findById(user.tenantId);
  return { user, tenant };
};
