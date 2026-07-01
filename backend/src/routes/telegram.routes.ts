import { Router } from 'express';
import { handleWebhook } from '../controllers/telegram.controller';

const router = Router();

// Telegram Webhook Endpoint
// IMPORTANT: This route must be public so Telegram can hit it
router.post('/webhook', handleWebhook);

export default router;
