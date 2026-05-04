import { Request, Response } from 'express';
import { ReviewService } from './review.service';

const createReview = async (req: Request, res: Response) => {
    try {
        const { eventId, rating, comment } = req.body;
        const userId = req.body.userId; // Mocked until auth middleware

        const result = await ReviewService.createReview(userId, eventId, { rating, comment });
        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to submit review", error });
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

export const ReviewController = {
    createReview,
    getEventReviews
};
