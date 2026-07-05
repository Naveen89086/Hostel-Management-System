import mongoose, { Schema } from 'mongoose';
import { IChatMessage } from '../types';

const chatMessageSchema = new Schema<IChatMessage>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: [true, 'Sender type is required'],
    },
    requestCreated: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
    },
    parsedIntent: { type: String },
  },
  { timestamps: true }
);

// Index for querying user's chat history
chatMessageSchema.index({ user: 1 });

export default mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
