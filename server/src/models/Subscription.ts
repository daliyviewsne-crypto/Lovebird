import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  _id: string;
  user: string; // User ID
  tier: 'plus' | 'gold' | 'platinum';
  billingCycle: 'monthly' | 'annual';
  startDate: Date;
  endDate: Date;
  renewalDate: Date;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePaymentMethodId: string;
  amount: number;
  currency: string;
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  autoRenew: boolean;
  features: {
    unlimitedLikes: boolean;
    rewind: boolean;
    passportMode: boolean;
    seeWhoLikesYou: boolean;
    dailySuperLikes: number;
    monthlyBoost: number;
    priorityLikes: boolean;
    messageBeforeMatch: boolean;
  };
  consumerCredits?: number; // For boost and other consumables
  canceledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tier: { type: String, enum: ['plus', 'gold', 'platinum'], required: true },
    billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    renewalDate: { type: Date, required: true },
    stripeCustomerId: { type: String, required: true },
    stripeSubscriptionId: { type: String, required: true },
    stripePaymentMethodId: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['active', 'canceled', 'expired', 'past_due'], default: 'active' },
    autoRenew: { type: Boolean, default: true },
    features: {
      unlimitedLikes: { type: Boolean, default: false },
      rewind: { type: Boolean, default: false },
      passportMode: { type: Boolean, default: false },
      seeWhoLikesYou: { type: Boolean, default: false },
      dailySuperLikes: { type: Number, default: 0 },
      monthlyBoost: { type: Number, default: 0 },
      priorityLikes: { type: Boolean, default: false },
      messageBeforeMatch: { type: Boolean, default: false }
    },
    consumerCredits: { type: Number, default: 0 },
    canceledAt: Date,
    cancelReason: String
  },
  { timestamps: true }
);

// Indexes for subscription queries
SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ endDate: 1 });
SubscriptionSchema.index({ renewalDate: 1 });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);