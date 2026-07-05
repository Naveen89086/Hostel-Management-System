import { Router } from 'express';
import { getRooms, getRoomById, createRoom, updateRoom, requestAllocation, deleteRoom } from '../controllers/room.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createRoomSchema } from '../validators/room.validator';

const router = Router();

router.use(protect);

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/request-allocation', requestAllocation);

// Admin only routes
router.post('/', authorize('admin'), validate(createRoomSchema), createRoom);
router.patch('/:id', authorize('admin'), updateRoom);
router.delete('/:id', authorize('admin'), deleteRoom);

export default router;
