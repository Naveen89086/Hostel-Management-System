import mongoose, { Schema } from 'mongoose';
import { IRoom } from '../types';

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor is required'],
    },
    block: {
      type: String,
      required: [true, 'Block is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
      max: 4,
    },
    occupants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    type: {
      type: String,
      enum: ['single', 'double', 'triple'],
      default: 'double',
    },
    amenities: [{ type: String }],
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance'],
      default: 'available',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for available slots
roomSchema.virtual('availableSlots').get(function () {
  return this.capacity - this.occupants.length;
});

// Indexes
roomSchema.index({ status: 1 });
roomSchema.index({ block: 1, floor: 1 });

export default mongoose.model<IRoom>('Room', roomSchema);
