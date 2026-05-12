import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  tenantId: string;
  branchId?: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    branchId: {
      type: String,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

SupplierSchema.index({ tenantId: 1, branchId: 1 });
SupplierSchema.index({ tenantId: 1, branchId: 1, isActive: 1 });

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);
