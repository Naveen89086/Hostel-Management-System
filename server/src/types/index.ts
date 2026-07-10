import { Document, Types } from 'mongoose';
import { Request } from 'express';

// ========================
// User Interface
// ========================
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'warden' | 'admin';
  block?: string;
  roomNumber?: string;
  rollNo?: string;
  registrationNumber?: string;
  gender?: 'Male' | 'Female' | 'Other';
  phone?: string;
  department?: string;
  year?: number;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ========================
// Room Interface
// ========================
export interface IRoom extends Document {
  roomNumber: string;
  floor: number;
  block: string;
  capacity: number;
  occupants: Types.ObjectId[];
  type: 'single' | 'double' | 'triple';
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance';
  availableSlots: number;
  createdAt: Date;
  updatedAt: Date;
}

// ========================
// Request Interface
// ========================
export interface IRequest extends Document {
  user: Types.ObjectId;
  type: 'room_allocation' | 'room_change' | 'maintenance' | 'complaint' | 'vacate' | 'general';
  title: string;
  description: string;
  roomNumber?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  category?: string;
  aiParsed: boolean;
  aiExtractedData?: any;
  assignedTo?: Types.ObjectId;
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========================
// Notice Interface
// ========================
export interface INotice extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  priority: 'normal' | 'important' | 'urgent';
  tags: string[];
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========================
// Chat Message Interface
// ========================
export interface IChatMessage extends Document {
  user: Types.ObjectId;
  message: string;
  sender: 'user' | 'ai';
  requestCreated?: Types.ObjectId;
  parsedIntent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========================
// JWT Payload
// ========================
export interface JwtPayload {
  id: string;
  role: string;
}

// ========================
// Auth Request (Extended Express Request)
// ========================
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}
