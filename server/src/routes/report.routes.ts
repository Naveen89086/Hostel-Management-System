import { Router } from 'express';
import { getDashboardStats, getRequestAnalytics } from '../controllers/report.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(authorize('admin', 'warden'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getRequestAnalytics);

export default router;
