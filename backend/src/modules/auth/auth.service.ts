import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt/jwt';
import Tenant from '../../shared/models/tenant/tenant.model';
import User from '../../shared/models/user/user.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { eventBus, Events } from '../../shared/utils/eventBus';

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

const generateTokens = (user: Record<string, any>, tenant: Record<string, any>) => {
  const accessToken = signAccessToken({
    userId: user._id.toString(),
    tenantId: tenant._id.toString(),
    role: user.role,
    branchId: user.branchId?.toString() ?? undefined,
    tokenVersion: user.tokenVersion ?? 0,
  });

  const refreshToken = signRefreshToken({
    userId: user._id.toString(),
    tokenVersion: user.tokenVersion ?? 0,
  });

  return { accessToken, refreshToken };
};

const mapTenant = (tenant: Record<string, any>) => ({
  _id: tenant._id.toString(),
  name: tenant.name,
  slug: tenant.slug,
  logo: tenant.logo,
  brandColor: tenant.brandColor,
  brandColorLight: tenant.brandColorLight,
  brandColorDark: tenant.brandColorDark,
  brandSidebar: tenant.brandSidebar,
});

const buildAuthResponse = (user: Record<string, any>, tenant: Record<string, any>, accessToken: string, refreshToken: string) => ({
  accessToken,
  refreshToken,
  user: {
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    branchId: user.branchId?.toString() ?? undefined,
  },
  tenant: mapTenant(tenant),
});

const handleFailedLoginAttempt = async (user: any) => {
  user.loginAttempts = (user.loginAttempts ?? 0) + 1;
  if (user.loginAttempts >= 5) {
    user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    user.loginAttempts = 0;
    await user.save();
    throw ApiError.unauthorized('Cuenta bloqueada por 15 minutos tras múltiples intentos fallidos.');
  }
  await user.save();
  throw ApiError.unauthorized('Invalid credentials');
};

const createTenantUserPair = async (input: RegisterTenantInput) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingTenant = await Tenant.findOne({ slug: input.tenantSlug }).session(session);
    if (existingTenant) throw ApiError.conflict('Tenant slug already exists');

    const tenant = new Tenant({ slug: input.tenantSlug, name: input.tenantName, email: input.email });
    await tenant.save({ session });

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = new User({
      tenantId: tenant._id.toString(), email: input.email, password: hashedPassword,
      firstName: input.firstName, lastName: input.lastName, role: 'owner', isActive: true,
    });
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    return { user, tenant };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const registerTenant = async (input: RegisterTenantInput) => {
  const { user, tenant } = await createTenantUserPair(input);
  const tokens = generateTokens(user, tenant);
  return buildAuthResponse(user, tenant, tokens.accessToken, tokens.refreshToken);
};

export const login = async (input: LoginInput) => {
  const tenant = await Tenant.findOne({ slug: input.tenantSlug });
  if (!tenant || !tenant.isActive) throw ApiError.unauthorized('Invalid credentials');

  const user = await User.findOne({ tenantId: tenant._id.toString(), email: input.email }).select('+password');
  if (!user || !user.isActive) throw ApiError.unauthorized('Invalid credentials');
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw ApiError.unauthorized(`Cuenta bloqueada. Intenta de nuevo en ${minutesLeft} minuto(s).`);
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) await handleFailedLoginAttempt(user);

  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockedUntil = null;
    await user.save();
  }

  const tokens = generateTokens(user, tenant);

  eventBus.emit(Events.USER_LOGIN, {
    userId: user._id.toString(),
    tenantId: tenant._id.toString(),
  });

  return buildAuthResponse(user, tenant, tokens.accessToken, tokens.refreshToken);
};

export const refreshTokens = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Usuario no encontrado o inactivo');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw ApiError.unauthorized('Sesión inválida. Inicia sesión nuevamente.');
    }

    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant || !tenant.isActive) {
      throw ApiError.unauthorized('Tenant no encontrado o inactivo');
    }

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      tenantId: tenant._id.toString(),
      role: user.role,
      branchId: user.branchId?.toString() ?? undefined,
      tokenVersion: user.tokenVersion,
    });

    return {
      accessToken,
      user: {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        branchId: user.branchId?.toString() ?? undefined,
      },
      tenant: mapTenant(tenant),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Sesión inválida. Inicia sesión nuevamente.');
  }
};

export const logout = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findByIdAndUpdate(payload.userId, { $inc: { tokenVersion: 1 } });
    if (user) {
      eventBus.emit(Events.USER_LOGOUT, {
        userId: payload.userId,
        tenantId: user.tenantId.toString(),
      });
    }
  } catch {
    // Si el refresh token ya es inválido, igual limpiamos la cookie
  }
};

export const getProfile = async (userId: string, tenantId: string) => {
  const user = await User.findOne({ _id: userId, tenantId }).select('-password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  const tenant = await Tenant.findById(user.tenantId);
  return { user, tenant };
};
