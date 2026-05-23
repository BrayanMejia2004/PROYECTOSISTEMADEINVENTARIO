import jwt from 'jsonwebtoken';
import { env } from '../../../config/env/env';

interface TokenPayload {
  userId: string;
  tenantId: string;
  role: string;
  branchId?: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};
