import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const joinEvent = async (userId: string, eventId: string) => {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError(status.NOT_FOUND, "Event not found");

    // If event is public and free, auto-approve. Otherwise, pending.
    const participantStatus = (event.eventType === "PUBLIC_FREE") ? "APPROVED" : "PENDING";

    const result = await prisma.eventParticipant.create({
        data: {
            userId,
            eventId,
            status: participantStatus,
        }
    });

    return result;
};

const updateParticipantStatus = async (participantId: string, newStatus: "APPROVED" | "REJECTED" | "BANNED") => {
    const result = await prisma.eventParticipant.update({
        where: { id: participantId },
        data: { status: newStatus }
    });
    return result;
};

const getEventParticipants = async (eventId: string) => {
    const result = await prisma.eventParticipant.findMany({
        where: { eventId },
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
    });
    return result;
};

export const ParticipationService = {
    joinEvent,
    updateParticipantStatus,
    getEventParticipants,
};
