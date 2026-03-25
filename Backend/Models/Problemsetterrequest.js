import mongoose from 'mongoose';

const ProblemSetterRequestSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email:    { type: String, required: true, lowercase: true },
  password: { type: String, required: true }, // hashed before save
  status:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  reviewedAt: { type: Date },
}, { timestamps: true });

import bcrypt from 'bcryptjs';
ProblemSetterRequestSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model('ProblemSetterRequest', ProblemSetterRequestSchema);