import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  age: { type: Number, min: 0, max: 120 }
}, { timestamps: true, versionKey: false, toJSON: { virtuals: true, transform: (_doc, ret) => { delete ret._id; return ret; } } });

customerSchema.index({ email: 1 }, { unique: true });
export const Customer = mongoose.model('Customer', customerSchema);
