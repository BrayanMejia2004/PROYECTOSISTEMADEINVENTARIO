import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  tenantId: string;
  branchId?: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    tenantId: { type: String, required: true, index: true },
    branchId: { type: String, index: true },
    name:     { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'brands' }
);

BrandSchema.index({ tenantId: 1, branchId: 1, name: 1 });

export default mongoose.model<IBrand>('Brand', BrandSchema);
