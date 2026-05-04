import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const getAllUsers = async () => {
    const result = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatar: true,
            image: true,
            createdAt: true,
        }
    });
    return result;
};

const getUserById = async (id: string) => {
    const result = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatar: true,
            image: true,
            createdAt: true,
        }
    });
    if (!result) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
    return result;
};

const getUserDashboardStats = async (userId: string) => {
    const totalEvents = await prisma.event.count({ where: { organizerId: userId } });
    const totalParticipations = await prisma.eventParticipant.count({ where: { userId } });
    const pendingInvitations = await prisma.invitation.count({ 
        where: { inviteeId: userId, status: 'PENDING' } 
    });

    // For organizers: How many people are attending their events
    const organizerEvents = await prisma.event.findMany({
        where: { organizerId: userId },
        select: {
            id: true,
            _count: {
                select: { participants: true }
            }
        }
    });
    const totalAttendees = organizerEvents.reduce((acc, curr) => acc + curr._count.participants, 0);

    // Calculate Revenue
    const eventIds = organizerEvents.map(e => e.id);
    const revenueData = await prisma.payment.aggregate({
        where: {
            eventId: { in: eventIds },
            status: 'COMPLETED'
        },
        _sum: { amount: true }
    });

    return {
        totalEvents,
        totalParticipations,
        pendingInvitations,
        totalAttendees,
        totalRevenue: revenueData._sum.amount || 0,
        ticketSales: totalAttendees // Simplified for now
    };
};

const updateProfile = async (id: string, payload: { name?: string; avatar?: string }) => {
    // Build the data object — write avatar URL to both `image` (Better Auth session field)
    // and `avatar` (custom field) so the session reflects changes immediately on reload.
    const data: Record<string, any> = {};
    if (payload.name !== undefined) data.name = payload.name;
    if (payload.avatar !== undefined) {
        data.avatar = payload.avatar;
        data.image  = payload.avatar; // Keep Better Auth session in sync
    }

    const result = await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            image: true,
            role: true
        }
    });
    return result;
};

export const UserService = {
    getAllUsers,
    getUserById,
    getUserDashboardStats,
    updateProfile
};
