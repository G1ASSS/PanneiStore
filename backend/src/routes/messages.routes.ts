import { Router } from 'express';
import {
  getConversations,
  getConversationMessages,
  sendMessage,
} from '../controllers/messages.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId', getConversationMessages);
router.post('/', uploadSingle, sendMessage);

export default router;
