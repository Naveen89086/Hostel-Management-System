import mongoose, { Schema } from 'mongoose';
import { INotice } from '../types';

const noticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    priority: {
      type: String,
      enum: ['normal', 'important', 'urgent'],
      default: 'normal',
    },
    tags: [{ type: String }],
    expiresAt: { type: Date },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
noticeSchema.index({ isActive: 1 });
noticeSchema.index({ priority: 1 });

export default mongoose.model<INotice>('Notice', noticeSchema);
