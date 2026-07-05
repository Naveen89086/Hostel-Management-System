import { Router } from 'express';
import { sendMessage, getChatHistory } from '../controllers/chat.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/message', sendMessage);
router.get('/history', getChatHistory);

export default router;
