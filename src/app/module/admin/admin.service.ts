import { prisma } from "../../lib/prisma";

const getPlatformStats = async () => {
    const totalUsers = await prisma.user.count();
    const totalEvents = await prisma.event.count();
    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
    });

    return {
        users: totalUsers,
        events: totalEvents,
        revenue: totalRevenue._sum.amount || 0
    };
};

const deleteUser = async (id: string) => {
    return await prisma.user.delete({ where: { id } });
};

const deleteEvent = async (id: string) => {
    return await prisma.event.delete({ where: { id } });
};

const featureEvent = async (id: string, isFeatured: boolean) => {
    return await prisma.event.update({
        where: { id },
        data: { isFeatured }
    });
};

const getAllUsers = async () => {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            emailVerified: true,
            image: true
        }
    });
};

const getAllEvents = async () => {
    return await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            organizer: {
                select: { name: true, email: true }
            },
            category: true
        }
    });
};

export const AdminService = {
    getPlatformStats,
    getAllUsers,
    getAllEvents,
    deleteUser,
    deleteEvent,
    featureEvent
};
