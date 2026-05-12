import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  tenantId: string;
  branchId?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    tenantId: { type: String, required: true, index: true },
    branchId: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    taxId: { type: String, trim: true },
    totalPurchases: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    lastPurchaseDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CustomerSchema.index({ tenantId: 1, branchId: 1 });
CustomerSchema.index({ tenantId: 1, branchId: 1, name: 1 });
CustomerSchema.index({ tenantId: 1, phone: 1 });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
