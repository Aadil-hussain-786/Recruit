import express from 'express';
import { getChatbotResponse } from '../controllers/chatbotController';

const router = express.Router();

router.post('/message', getChatbotResponse);

export default router;
