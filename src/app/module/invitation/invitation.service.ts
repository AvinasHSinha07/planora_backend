import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { NotificationService } from "../notification/notification.service";

const inviteUser = async (inviterId: string, eventId: string, email: string) => {
    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) throw new AppError(status.NOT_FOUND, "User not found with this email");

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError(status.NOT_FOUND, "Event not found");

    if (event.organizerId !== inviterId) {
        throw new AppError(status.FORBIDDEN, "Only the organizer can invite users");
    }

    const existingInvitation = await prisma.invitation.findUnique({
        where: {
            eventId_inviteeId: {
                eventId,
                inviteeId: invitee.id
            }
        }
    });

    if (existingInvitation) throw new AppError(status.BAD_REQUEST, "User already invited");

    const result = await prisma.invitation.create({
        data: {
            inviterId,
            inviteeId: invitee.id,
            eventId,
            status: 'PENDING'
        }
    });

    await NotificationService.createNotification(
        invitee.id,
        "New Event Invitation",
        `You have been invited to "${event.title}" by ${inviterId === event.organizerId ? "the organizer" : "a host"}.`
    );

    return result;
};

const getMyInvitations = async (userId: string) => {
    const result = await prisma.invitation.findMany({
        where: { inviteeId: userId },
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
            },
            inviter: {
                select: {
                    name: true,
                    avatar: true,
                    image: true
                }
            }
        }
    });
    return result;
};

const updateInvitationStatus = async (userId: string, invitationId: string, newStatus: "APPROVED" | "REJECTED") => {
    const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
        include: { event: true }
    });

    if (!invitation) {
        throw new AppError(status.NOT_FOUND, "Invitation not found");
    }

    if (invitation.inviteeId !== userId) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to respond to this invitation");
    }

    const result = await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: newStatus }
    });

    // If approved, create participation
    if (newStatus === "APPROVED") {
        await prisma.eventParticipant.upsert({
            where: {
                userId_eventId: {
                    userId,
                    eventId: invitation.eventId
                }
            },
            update: { status: "APPROVED" },
            create: {
                userId,
                eventId: invitation.eventId,
                status: "APPROVED"
            }
        });
    }

    return result;
};

export const InvitationService = {
    inviteUser,
    getMyInvitations,
    updateInvitationStatus
};
