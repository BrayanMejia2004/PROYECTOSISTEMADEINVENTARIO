import { Request, Response, NextFunction } from 'express';

export const sanitizePagination = (req: Request, _res: Response, next: NextFunction) => {
  if (req.query.page) {
    const page = parseInt(req.query.page as string, 10);
    req.query.page = String(Math.max(1, isNaN(page) ? 1 : page));
  }
  if (req.query.limit) {
    const limit = parseInt(req.query.limit as string, 10);
    req.query.limit = String(Math.min(100, Math.max(1, isNaN(limit) ? 20 : limit)));
  }
  next();
};
