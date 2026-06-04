import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { AuthRequest } from '../../shared/types/express/express';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
};

export const registerTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantName, tenantSlug, email, password, firstName, lastName } = req.body;
    const result = await authService.registerTenant({
      tenantName,
      tenantSlug,
      email,
      password,
      firstName,
      lastName,
    });
    res.cookie('token', result.token, cookieOptions);
    const { token, ...rest } = result;
    sendSuccess(res, 'Tenant registered successfully', rest, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, tenantSlug } = req.body;
    const result = await authService.login({ email, password, tenantSlug });
    res.cookie('token', result.token, cookieOptions);
    const { token, ...rest } = result;
    sendSuccess(res, 'Login successful', rest);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId || !req.user?.tenantId) {
      throw new Error('User ID or Tenant ID missing');
    }
    const profile = await authService.getProfile(req.user.userId, req.user.tenantId);
    sendSuccess(res, 'Profile retrieved', profile);
  } catch (error) {
    next(error);
  }
};
