import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  tenantId: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  departmentId?: string;
  brandId?: string;
  supplierId?: string;
  image?: string;
  costPrice: number;
  price: number;
  wholesalePrice?: number;
  specialPrice?: number;
  applyTax: boolean;
  taxPercentage: number;
  allowsDiscount: boolean;
  maxDiscount: number;
  minStock: number;
  maxStock: number;
  sellOutOfStock: boolean;
  unit: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    departmentId: {
      type: String,
      index: true,
    },
    brandId: {
      type: String,
      trim: true,
    },
    supplierId: {
      type: String,
      index: true,
    },
    image: {
      type: String,
      trim: true,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    wholesalePrice: {
      type: Number,
      min: 0,
    },
    specialPrice: {
      type: Number,
      min: 0,
    },
    applyTax: {
      type: Boolean,
      default: true,
    },
    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    allowsDiscount: {
      type: Boolean,
      default: true,
    },
    maxDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    sellOutOfStock: {
      type: Boolean,
      default: false,
    },
    unit: {
      type: String,
      default: 'unit',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ProductSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ tenantId: 1, barcode: 1 }, { unique: true, sparse: true });
ProductSchema.index({ tenantId: 1, name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
