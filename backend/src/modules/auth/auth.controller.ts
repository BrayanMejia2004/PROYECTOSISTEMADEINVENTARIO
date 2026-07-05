import { Request, Response } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { env } from '../../config/env/env';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { AuthRequest } from '../../shared/types/express/express';

const REFRESH_COOKIE = 'refreshToken';

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 2 * 60 * 60 * 1000,
  path: '/api/v1/auth/refresh',
});

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, getRefreshCookieOptions());
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth/refresh' });
};

export const registerTenant = asyncHandler(async (req: Request, res: Response) => {
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
  sendSuccess(res, 'Negocio registrado exitosamente', rest, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, tenantSlug } = req.body;
  const result = await authService.login({ email, password, tenantSlug });
  setRefreshCookie(res, result.refreshToken);
  const { refreshToken: _, ...rest } = result;
  sendSuccess(res, 'Inicio de sesión exitoso', rest);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) {
    sendSuccess(res, 'Sin sesión', { accessToken: null, user: null, tenant: null });
    return;
  }
  const result = await authService.refreshTokens(refreshToken);
  setRefreshCookie(res, result.refreshToken);
  const { refreshToken: _, ...rest } = result;
  sendSuccess(res, 'Token renovado', rest);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  clearRefreshCookie(res);
  sendSuccess(res, 'Sesión cerrada');
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId || !req.user?.tenantId) {
    throw ApiError.unauthorized(
      'ID de usuario o tenant no proporcionados en getProfile',
      'Sesión inválida. Inicia sesión nuevamente.'
    );
  }
  const profile = await authService.getProfile(req.user.userId, req.user.tenantId);
  sendSuccess(res, 'Perfil obtenido', profile);
});
