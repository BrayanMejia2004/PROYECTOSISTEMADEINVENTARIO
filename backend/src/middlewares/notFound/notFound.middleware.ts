import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../shared/utils/apiError/ApiError';

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound('Route not found'));
};
