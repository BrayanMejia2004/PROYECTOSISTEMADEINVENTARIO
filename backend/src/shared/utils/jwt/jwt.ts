import jwt from 'jsonwebtoken';
import { env } from '../../../config/env/env';

export interface AccessTokenPayload {
  userId: string;
  tenantId: string;
  role: string;
  branchId?: string;
  tokenVersion: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
  if (!payload.tenantId || !payload.role) {
    throw new jwt.JsonWebTokenError('Invalid access token payload');
  }
  return payload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const payload = jwt.verify(token, env.JWT_SECRET) as RefreshTokenPayload;
  if (!payload.userId || payload.tokenVersion === undefined) {
    throw new jwt.JsonWebTokenError('Invalid refresh token payload');
  }
  return payload;
};
