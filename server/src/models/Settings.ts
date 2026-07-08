import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  hostelName: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  autoApproveLeaves: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    hostelName: {
      type: String,
      default: 'SmartHostel',
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'admin@smarthostel.com',
      required: true,
      trim: true,
    },
    supportPhone: {
      type: String,
      default: '+1 (555) 123-4567',
      required: true,
    },
    enableGlobalNotifications: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    autoApproveLeaves: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', settingsSchema);
