import express from 'express';
import { AiController } from './ai.controller';

const router = express.Router();

router.post('/recommend', AiController.getRecommendations);

export const AiRoutes = router;
