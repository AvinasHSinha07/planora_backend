import { Request, Response } from 'express';
import { AiService } from './ai.service';

const getRecommendations = async (req: Request, res: Response) => {
    try {
        const { preferences } = req.body;
        const result = await AiService.getEventRecommendations(preferences || "music and tech");
        res.status(200).json({
            success: true,
            message: "AI Recommendations retrieved",
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "AI Request failed", error });
    }
};

export const AiController = {
    getRecommendations
};
