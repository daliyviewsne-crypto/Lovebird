import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  match: string; // Match ID
  sender: string; // User ID
  recipient: string; // User ID
  messageType: 'text' | 'image' | 'video' | 'voice' | 'gif';
  content: string;
  mediaUrl?: string;
  mediaThumbnail?: string;
  isRead: boolean;
  readAt?: Date;
  isDelivered: boolean;
  deliveredAt: Date;
  reactions?: Array<{
    emoji: string;
    userId: string;
  }>;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    match: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messageType: { type: String, enum: ['text', 'image', 'video', 'voice', 'gif'], default: 'text' },
    content: { type: String, required: true },
    mediaUrl: String,
    mediaThumbnail: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
    isDelivered: { type: Boolean, default: true },
    deliveredAt: { type: Date, default: Date.now },
    reactions: [
      {
        emoji: String,
        userId: { type: Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    deletedAt: Date
  },
  { timestamps: true }
);

// Indexes for efficient message queries
MessageSchema.index({ match: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ recipient: 1 });
MessageSchema.index({ isRead: 1 });
MessageSchema.index({ createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);