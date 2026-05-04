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

const getRevenueStats = async () => {
    const [totalPayments, refundedPayments, completedPayments] = await Promise.all([
        prisma.payment.count(),
        prisma.payment.count({ where: { status: 'REFUNDED' } }),
        prisma.payment.findMany({ 
            where: { status: 'COMPLETED' },
            select: { amount: true }
        })
    ]);

    const grossVolume = completedPayments.reduce((acc, p) => acc + p.amount, 0);
    const platformCommission = grossVolume * 0.10; // 10% platform fee
    const refundRate = totalPayments > 0 ? (refundedPayments / totalPayments) * 100 : 0;

    return {
        grossVolume,
        platformCommission,
        refundRate: Number(refundRate.toFixed(2)),
        totalTransactions: totalPayments,
        completedTransactions: completedPayments.length,
        refundedTransactions: refundedPayments
    };
};

export const AdminService = {
    getPlatformStats,
    getRevenueStats,
    getAllUsers,
    getAllEvents,
    deleteUser,
    deleteEvent,
    featureEvent
};
