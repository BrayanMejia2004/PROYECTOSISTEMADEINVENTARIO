import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { AuthRequest } from '../../shared/types/express/express';

const REFRESH_COOKIE = 'refreshToken';

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth/refresh',
});

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, getRefreshCookieOptions());
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth/refresh' });
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
    setRefreshCookie(res, result.refreshToken);
    const { refreshToken: _, ...rest } = result;
    sendSuccess(res, 'Tenant registered successfully', rest, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, tenantSlug } = req.body;
    const result = await authService.login({ email, password, tenantSlug });
    setRefreshCookie(res, result.refreshToken);
    const { refreshToken: _, ...rest } = result;
    sendSuccess(res, 'Login successful', rest);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      return sendSuccess(res, 'No session', { accessToken: null, user: null, tenant: null });
    }
    const result = await authService.refreshTokens(refreshToken);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, 'Token refreshed', result);
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearRefreshCookie(res);
    sendSuccess(res, 'Logged out');
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
