import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { getSettings, updateSettings } from '../controllers/settings.controller';

const router = express.Router();

// Settings routes are strictly for admins
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getSettings)
  .put(updateSettings);

export default router;
