export interface Customer {
  _id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
