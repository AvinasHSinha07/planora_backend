import { Request, Response, NextFunction } from 'express';
import { AiService } from './ai.service';

const getRecommendations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { preferences } = req.body;
        const result = await AiService.getEventRecommendations(preferences);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error("[AiController] Recommendation Error:", error?.message || error);
        next(error);
    }
};

const chatWithAI = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const response = await AiService.getChatResponse(message, history || []);

        res.status(200).json({
            success: true,
            message: "AI response generated",
            data: response
        });
    } catch (error: any) {
        console.error("[AiController] Chat Error:", error?.message || error);
        next(error);
    }
};

const architectEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bullets } = req.body;
        const result = await AiService.architectEvent(bullets);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        next(error);
    }
};

const generateTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { description } = req.body;
        const result = await AiService.suggestTags(description);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        next(error);
    }
};

export const AiController = {
    getRecommendations,
    chatWithAI,
    architectEvent,
    generateTags
};
