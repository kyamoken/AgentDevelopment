import { Router } from 'express';
import { getConversations, createConversation, getMessages, sendMessage } from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All chat routes require authentication
router.use(authenticateToken);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);

// Message routes
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

export default router;