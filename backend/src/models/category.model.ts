import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  tenantId: string;
  branchId?: string;
  name: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
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
    parentId: {
      type: String,
      index: true,
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

CategorySchema.index({ tenantId: 1, branchId: 1 });
CategorySchema.index({ tenantId: 1, branchId: 1, parentId: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);
