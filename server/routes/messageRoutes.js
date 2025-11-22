import express from 'express';
import {
  sendMessage,
  getConversation,
  getAllConversations,
  markMessagesAsRead,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', sendMessage);
router.get('/conversations', getAllConversations);
router.get('/:userId', getConversation);
router.put('/read/:userId', markMessagesAsRead);

export default router;
