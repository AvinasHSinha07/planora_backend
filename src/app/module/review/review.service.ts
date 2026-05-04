import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const createReview = async (userId: string, eventId: string, payload: { rating: number; comment?: string }) => {
    // Check if user participated
    const participant = await prisma.eventParticipant.findUnique({
        where: { userId_eventId: { userId, eventId } }
    });

    if (!participant || participant.status !== 'APPROVED') {
        throw new AppError(status.FORBIDDEN, "You must be an approved participant to review an event");
    }

    const result = await prisma.review.create({
        data: {
            userId,
            eventId,
            rating: payload.rating,
            comment: payload.comment,
        }
    });

    return result;
};

const getEventReviews = async (eventId: string) => {
    const result = await prisma.review.findMany({
        where: { eventId },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
    });
    return result;
};

export const ReviewService = {
    createReview,
    getEventReviews,
};
