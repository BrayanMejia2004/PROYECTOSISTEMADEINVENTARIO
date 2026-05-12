import { Response } from 'express';

export interface ApiResponseData<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response => {
  const response: ApiResponseData<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  message: string,
  data: T[],
  meta: { total: number; page: number; limit: number },
  statusCode: number = 200
): Response => {
  const response: ApiResponseData<T[]> = {
    success: true,
    message,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
