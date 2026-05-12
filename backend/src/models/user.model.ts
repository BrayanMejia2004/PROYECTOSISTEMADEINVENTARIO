import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  tenantId: string;
  branchId?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'cashier';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
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
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'cashier'],
      required: true,
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

UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, role: 1 });

export default mongoose.model<IUser>('User', UserSchema);
