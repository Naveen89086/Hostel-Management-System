import { Router } from 'express';
import { getNotices, createNotice, updateNotice, deleteNotice } from '../controllers/notice.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createNoticeSchema } from '../validators/notice.validator';

const router = Router();

router.use(protect);

router.get('/', getNotices);

// Warden and Admin routes
router.post('/', authorize('admin', 'warden'), validate(createNoticeSchema), createNotice);
router.patch('/:id', authorize('admin', 'warden'), updateNotice);
router.delete('/:id', authorize('admin', 'warden'), deleteNotice);

export default router;
