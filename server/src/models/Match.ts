import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  _id: string;
  user1: string; // User ID
  user2: string; // User ID
  user1Like: boolean;
  user2Like: boolean;
  matchedAt?: Date;
  lastMessageAt?: Date;
  messages: string[]; // Array of Message IDs
  isActive: boolean;
  unmatchedBy?: string; // User ID who unmatched
  unmatchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    user1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user1Like: { type: Boolean, default: false },
    user2Like: { type: Boolean, default: false },
    matchedAt: Date,
    lastMessageAt: Date,
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    isActive: { type: Boolean, default: true },
    unmatchedBy: Schema.Types.ObjectId,
    unmatchedAt: Date
  },
  { timestamps: true }
);

// Compound index for efficient match lookup
MatchSchema.index({ user1: 1, user2: 1 }, { unique: true });
MatchSchema.index({ user1: 1 });
MatchSchema.index({ user2: 1 });
MatchSchema.index({ matchedAt: -1 });
MatchSchema.index({ isActive: 1 });

export default mongoose.model<IMatch>('Match', MatchSchema);