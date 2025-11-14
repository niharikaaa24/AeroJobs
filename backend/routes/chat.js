import express from 'express';
import { chatHandler } from '../controllers/chat.js';

const router = express.Router();

router.post('/', chatHandler);

export default router;
