import mongoose, { Schema } from 'mongoose';
import { IRequest } from '../types';

const requestSchema = new Schema<IRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: ['room_allocation', 'room_change', 'maintenance', 'complaint', 'vacate', 'general'],
      required: [true, 'Request type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    roomNumber: { type: String },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    category: { type: String },
    aiParsed: {
      type: Boolean,
      default: false,
    },
    aiExtractedData: { type: Schema.Types.Mixed },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    response: { type: String },
  },
  { timestamps: true }
);

// Indexes
requestSchema.index({ user: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ type: 1 });

export default mongoose.model<IRequest>('Request', requestSchema);
