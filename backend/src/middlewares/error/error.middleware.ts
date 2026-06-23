import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { env } from '../../config/env/env';
import { logger } from '../../config/logger/logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'El archivo excede el límite de 10 MB',
      LIMIT_FILE_COUNT: 'Demasiados archivos',
      LIMIT_UNEXPECTED_FILE: 'Campo de archivo inesperado',
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] || 'Error al subir archivo',
    });
  }

  logger.error('Error no gestionado', { message: err.message, stack: env.NODE_ENV !== 'production' ? err.stack : undefined });
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
};
