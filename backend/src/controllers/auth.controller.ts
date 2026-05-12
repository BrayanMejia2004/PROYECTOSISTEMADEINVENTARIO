import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types/express';

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
    sendSuccess(res, 'Tenant registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, tenantSlug } = req.body;
    const result = await authService.login({ email, password, tenantSlug });
    sendSuccess(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      throw new Error('User ID missing');
    }
    const profile = await authService.getProfile(req.user.userId);
    sendSuccess(res, 'Profile retrieved', profile);
  } catch (error) {
    next(error);
  }
};
