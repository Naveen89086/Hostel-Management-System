export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'warden' | 'admin';
  roomNumber?: string;
  block?: string;
  registrationNumber?: string;
  gender?: string;
  phone?: string;
  department?: string;
  year?: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  floor: number;
  block: string;
  capacity: number;
  occupants: User[] | string[];
  type: 'single' | 'double' | 'triple';
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface Request {
  _id: string;
  user: User | string;
  type: 'room_allocation' | 'room_change' | 'maintenance' | 'complaint' | 'vacate' | 'general';
  title: string;
  description: string;
  roomNumber?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  category?: string;
  aiParsed: boolean;
  aiExtractedData?: Record<string, any>;
  assignedTo?: User | string;
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  author: User | string;
  priority: 'normal' | 'important' | 'urgent';
  tags: string[];
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  user: string;
  message: string;
  sender: 'user' | 'ai';
  requestCreated?: Request | string;
  parsedIntent?: Record<string, any>;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  data?: {
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface RequestStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  byType: Record<string, number>;
  byUrgency: Record<string, number>;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  totalRequests: number;
  pendingRequests: number;
  totalStudents: number;
  totalNotices: number;
}
