import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ApiError } from '../../shared/utils/apiError/ApiError';

const formatZodError = (error: z.ZodError): string =>
  error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');

const handleError = (error: unknown, next: NextFunction) => {
  if (error instanceof z.ZodError) {
    next(ApiError.badRequest(`Error de validación: ${formatZodError(error)}`));
    return;
  }
  next(error);
};

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      handleError(error, next);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      handleError(error, next);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      handleError(error, next);
    }
  };
};
