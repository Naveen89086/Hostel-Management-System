import { Router } from 'express';
import { getProfile, updateProfile, getAllUsers, updateUserStatus, updateUserRole, deleteUser, createUser } from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

// Admin only routes
router.get('/', authorize('admin', 'warden'), getAllUsers);
router.post('/', authorize('admin', 'warden'), createUser);
router.patch('/:id/status', authorize('admin'), updateUserStatus);
router.patch('/:id/role', authorize('admin'), updateUserRole);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
