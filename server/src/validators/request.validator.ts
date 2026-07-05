import { z } from 'zod';

export const createRequestSchema = z.object({
  type: z.enum([
    'room_allocation',
    'room_change',
    'maintenance',
    'complaint',
    'vacate',
    'general',
  ]),
  title: z.string().min(3, 'Title must be at least 3 characters').trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  roomNumber: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});
