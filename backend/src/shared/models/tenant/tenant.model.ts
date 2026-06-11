import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  nit: { type: String },
  logo: { type: String },
  brandColor: { type: String, default: '#2D8A4E' },
  brandColorLight: { type: String, default: '#6ABF8A' },
  brandColorDark: { type: String, default: '#1E5A32' },
  brandSidebar: { type: String, default: '#1E293B' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Tenant', tenantSchema);
