import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  sku: { type: String, required: true },
  barcode: { type: String },
  name: { type: String, required: true },
  description: { type: String },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  image: { type: String },
  costPrice: { type: Number, default: 0 },
  price: { type: Number, required: true },
  wholesalePrice: { type: Number },
  specialPrice: { type: Number },
  applyTax: { type: Boolean, default: true },
  taxPercentage: { type: Number, default: 19 },
  allowsDiscount: { type: Boolean, default: true },
  maxDiscount: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 0 },
  sellOutOfStock: { type: Boolean, default: false },
  unit: { type: String, default: 'unidad' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
productSchema.index({ tenantId: 1, barcode: 1 });
productSchema.index({ tenantId: 1, name: 'text', sku: 'text', barcode: 'text' });

export default mongoose.model('Product', productSchema);
