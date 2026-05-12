import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  tenantId: string;
  branchId?: string;
  name: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
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
    collection: 'categories',
  }
);

DepartmentSchema.index({ tenantId: 1, branchId: 1 });
DepartmentSchema.index({ tenantId: 1, branchId: 1, parentId: 1 });

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
