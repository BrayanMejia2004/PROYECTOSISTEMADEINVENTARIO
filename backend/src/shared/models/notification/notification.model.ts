import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true, sparse: true },
  type: { type: String, enum: ['expiration_soon', 'expired', 'payment_received', 'info'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  forRole: { type: String, enum: ['admin', 'tenant', 'all'], default: 'all' },
  referenceId: { type: String },
}, { timestamps: true });

notificationSchema.index({ tenantId: 1, createdAt: -1 });
notificationSchema.index({ tenantId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
