import { z } from 'zod';

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  floor: z.number().min(0, 'Floor must be a positive number'),
  block: z.string().min(1, 'Block is required'),
  capacity: z.number().min(1).max(4, 'Capacity must be between 1 and 4'),
  type: z.enum(['single', 'double', 'triple']),
  amenities: z.array(z.string()).optional(),
});
