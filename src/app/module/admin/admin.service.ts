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

export const AdminService = {
    getPlatformStats,
    deleteUser,
    deleteEvent,
    featureEvent
};
