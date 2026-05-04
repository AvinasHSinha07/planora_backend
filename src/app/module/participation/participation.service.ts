import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { NotificationService } from "../notification/notification.service";

const joinEvent = async (userId: string, eventId: string) => {
    const event = await prisma.event.findUnique({ 
        where: { id: eventId },
        include: { organizer: true } 
    });
    if (!event) throw new AppError(status.NOT_FOUND, "Event not found");

    if (event.organizerId === userId) {
        throw new AppError(status.BAD_REQUEST, "You are the organizer of this event");
    }

    const existingParticipant = await prisma.eventParticipant.findUnique({
        where: {
            userId_eventId: {
                userId,
                eventId
            }
        }
    });

    if (existingParticipant) {
        throw new AppError(status.BAD_REQUEST, "You have already joined or requested to join this event");
    }

    // If event is public and free, auto-approve. Otherwise, pending.
    const participantStatus = (event.eventType === "PUBLIC_FREE") ? "APPROVED" : "PENDING";

    const result = await prisma.eventParticipant.create({
        data: {
            userId,
            eventId,
            status: participantStatus,
        }
    });

    // Notify Organizer
    await NotificationService.createNotification(
        event.organizerId,
        "New Participation Request",
        `A user has requested to join your event "${event.title}".`
    );

    return result;
};

const updateParticipantStatus = async (participantId: string, newStatus: "APPROVED" | "REJECTED" | "BANNED") => {
    const participant = await prisma.eventParticipant.findUnique({
        where: { id: participantId },
        include: { event: true }
    });

    if (!participant) throw new AppError(status.NOT_FOUND, "Participant record not found");

    const result = await prisma.eventParticipant.update({
        where: { id: participantId },
        data: { status: newStatus }
    });

    // Notify Participant
    await NotificationService.createNotification(
        participant.userId,
        `Participation ${newStatus}`,
        `Your participation for "${participant.event.title}" has been ${newStatus.toLowerCase()}.`
    );

    return result;
};

const getEventParticipants = async (eventId: string) => {
    const result = await prisma.eventParticipant.findMany({
        where: { eventId },
        include: { user: { select: { id: true, name: true, email: true, avatar: true, image: true } } }
    });
    return result;
};

const getMyParticipations = async (userId: string) => {
    const result = await prisma.eventParticipant.findMany({
        where: { userId },
        include: {
            event: {
                include: {
                    category: true,
                    organizer: {
                        select: {
                            name: true,
                            avatar: true,
                            image: true
                        }
                    }
                }
            }
        },
        orderBy: { joinedAt: 'desc' }
    });
    return result;
};

const removeParticipant = async (participantId: string) => {
    const result = await prisma.eventParticipant.delete({
        where: { id: participantId }
    });
    return result;
};

export const ParticipationService = {
    joinEvent,
    updateParticipantStatus,
    getEventParticipants,
    getMyParticipations,
    removeParticipant,
};
