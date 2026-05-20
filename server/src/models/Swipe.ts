import mongoose, { Schema, Document } from 'mongoose';

export interface ISwipe extends Document {
  _id: string;
  swiper: string; // User ID
  swiped: string; // User ID
  direction: 'like' | 'nope' | 'superlike';
  timestamp: Date;
  createdAt: Date;
}

const SwipeSchema = new Schema<ISwipe>(
  {
    swiper: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    swiped: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    direction: { type: String, enum: ['like', 'nope', 'superlike'], required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for swipe queries
SwipeSchema.index({ swiper: 1, swiped: 1 }, { unique: true });
SwipeSchema.index({ swiper: 1, direction: 1 });
SwipeSchema.index({ swiped: 1, direction: 1 });
SwipeSchema.index({ timestamp: -1 });

export default mongoose.model<ISwipe>('Swipe', SwipeSchema);