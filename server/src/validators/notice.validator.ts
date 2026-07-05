import { z } from 'zod';

export const createNoticeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').trim(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  priority: z.enum(['normal', 'important', 'urgent']).optional(),
  tags: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
});
