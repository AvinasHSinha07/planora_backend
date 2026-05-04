import express from 'express';
import { AiController } from './ai.controller';

const router = express.Router();

router.post('/recommendations', AiController.getRecommendations);
router.post('/chat', AiController.chatWithAI);

export const AiRoutes = router;
