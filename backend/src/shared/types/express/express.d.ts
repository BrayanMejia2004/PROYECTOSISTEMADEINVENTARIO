import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    role: string;
    branchId?: string;
  };
  tenant?: {
    _id: string;
    slug: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    nit?: string;
    isActive: boolean;
  };
}
