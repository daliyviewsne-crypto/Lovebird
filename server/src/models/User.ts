import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  passwordHash?: string;
  dateOfBirth: Date;
  age: number;
  gender: 'male' | 'female' | 'other';
  showGender: boolean;
  sexualOrientation: string[];
  interestedIn: ('male' | 'female' | 'everyone')[];
  bio?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  photos: Array<{
    url: string;
    order: number;
    isVideo: boolean;
    successRate?: number;
    createdAt: Date;
  }>;
  interests: string[];
  datingIntentions: string[];
  profession?: string;
  isVerified: boolean;
  verificationSelfie?: string;
  blockedUsers: string[];
  reportedUsers: string[];
  subscription: {
    tier: 'free' | 'plus' | 'gold' | 'platinum';
    startDate: Date;
    endDate?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  preferences: {
    ageRange: { min: number; max: number };
    distanceRange: number; // in km
    searchRadius: number; // in km
  };
  stats: {
    totalLikes: number;
    totalMatches: number;
    totalSwipes: number;
    lastActive: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: String,
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String, sparse: true, unique: true },
    passwordHash: String,
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, required: true, min: 18, max: 120 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    showGender: { type: Boolean, default: true },
    sexualOrientation: [String],
    interestedIn: { type: [String], enum: ['male', 'female', 'everyone'] },
    bio: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      },
      address: String
    },
    photos: [
      {
        url: { type: String, required: true },
        order: { type: Number, required: true },
        isVideo: { type: Boolean, default: false },
        successRate: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    interests: { type: [String], minlength: 3, maxlength: 5 },
    datingIntentions: [String],
    profession: String,
    isVerified: { type: Boolean, default: false },
    verificationSelfie: String,
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reportedUsers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        reportedAt: { type: Date, default: Date.now }
      }
    ],
    subscription: {
      tier: { type: String, enum: ['free', 'plus', 'gold', 'platinum'], default: 'free' },
      startDate: { type: Date, default: Date.now },
      endDate: Date,
      stripeCustomerId: String,
      stripeSubscriptionId: String
    },
    preferences: {
      ageRange: {
        min: { type: Number, default: 18 },
        max: { type: Number, default: 99 }
      },
      distanceRange: { type: Number, default: 50 },
      searchRadius: { type: Number, default: 50 }
    },
    stats: {
      totalLikes: { type: Number, default: 0 },
      totalMatches: { type: Number, default: 0 },
      totalSwipes: { type: Number, default: 0 },
      lastActive: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
UserSchema.index({ 'location.coordinates': '2dsphere' });
UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ 'subscription.tier': 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.model<IUser>('User', UserSchema);