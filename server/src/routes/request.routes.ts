import { Router } from 'express';
import { getRequests, getRequestById, createRequest, updateRequest, getRequestStats } from '../controllers/request.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createRequestSchema } from '../validators/request.validator';

const router = Router();

router.use(protect);

router.get('/', getRequests);
router.get('/stats', authorize('admin', 'warden'), getRequestStats);
router.get('/:id', getRequestById);
router.post('/', validate(createRequestSchema), createRequest);
router.patch('/:id', authorize('admin', 'warden'), updateRequest);

export default router;
