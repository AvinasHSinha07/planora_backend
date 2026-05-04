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

    return {
        totalEvents,
        totalParticipations,
        pendingInvitations
    };
};

export const UserService = {
    getAllUsers,
    getUserById,
    getUserDashboardStats
};
