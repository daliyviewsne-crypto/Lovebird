import mongoose, { Schema, Document } from 'mongoose';

export interface IBoost extends Document {
  _id: string;
  user: string; // User ID
  startTime: Date;
  endTime: Date;
  multiplier: number; // How many times more visibility
  isPaid: boolean;
  status: 'active' | 'expired' | 'used';
  createdAt: Date;
  updatedAt: Date;
}

const BoostSchema = new Schema<IBoost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, required: true },
    multiplier: { type: Number, default: 3 },
    isPaid: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'expired', 'used'], default: 'active' }
  },
  { timestamps: true }
);

// Indexes for boost queries
BoostSchema.index({ user: 1 });
BoostSchema.index({ status: 1 });
BoostSchema.index({ endTime: 1 });

export default mongoose.model<IBoost>('Boost', BoostSchema);