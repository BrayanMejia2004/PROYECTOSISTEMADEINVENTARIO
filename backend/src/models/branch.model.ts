import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  tenantId: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
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

BranchSchema.index({ tenantId: 1, isActive: 1 });

export default mongoose.model<IBranch>('Branch', BranchSchema);
