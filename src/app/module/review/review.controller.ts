import { Request, Response } from 'express';
import { ReviewService } from './review.service';

const createReview = async (req: Request, res: Response) => {
    try {
        const { eventId, rating, comment } = req.body;
        const userId = (req as any).user.id;

        const result = await ReviewService.createReview(userId, eventId, { rating, comment });
        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: result
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to submit review", error });
    }
};

const getEventReviews = async (req: Request, res: Response) => {
    try {
        const result = await ReviewService.getEventReviews(req.params.eventId as string);
        res.status(200).json({
            success: true,
            message: "Reviews retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to get reviews", error });
    }
};

const getMyReviews = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await ReviewService.getMyReviews(userId);
        res.status(200).json({
            success: true,
            message: "Your event reviews retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to get your reviews", error });
    }
};

export const ReviewController = {
    createReview,
    getEventReviews,
    getMyReviews,
};
