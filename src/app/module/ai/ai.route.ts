import express from 'express';
import { AiController } from './ai.controller';

const router = express.Router();

router.post('/recommendations', AiController.getRecommendations);
router.post('/chat', AiController.chatWithAI);
router.post('/architect', AiController.architectEvent);
router.post('/tags', AiController.generateTags);

export const AiRoutes = router;
