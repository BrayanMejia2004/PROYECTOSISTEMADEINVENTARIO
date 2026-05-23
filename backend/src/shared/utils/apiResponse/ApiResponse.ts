import { Response } from 'express';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export const sendSuccess = (res: Response, message: string, data: any = null, statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendPaginated = (res: Response, message: string, data: any, meta: PaginationMeta) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
};
