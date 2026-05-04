import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const getAllUsers = async (query: any) => {
    const { searchTerm, role, limit, page } = query;
    const where: any = {};

    if (searchTerm) {
        where.OR = [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
        ];
    }

    if (role && role !== 'ALL') {
        where.role = role;
    }

    const take = limit ? Number(limit) : 10;
    const skip = page ? (Number(page) - 1) * take : 0;

    const [result, total] = await Promise.all([
        prisma.user.findMany({
            where,
            take,
            skip,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                image: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
    ]);

    return {
        users: result,
        meta: {
            total,
            page: Number(page) || 1,
            limit: take,
            totalPages: Math.ceil(total / take)
        }
    };
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

    const eventIds = organizerEvents.map(e => e.id);
    const revenueData = await prisma.payment.aggregate({
        where: {
            eventId: { in: eventIds },
            status: 'COMPLETED'
        },
        _sum: { amount: true }
    });

    // Growth Data for Organizers (Attendance over last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentParticipations = await prisma.eventParticipant.findMany({
        where: {
            eventId: { in: eventIds },
            joinedAt: { gte: sevenDaysAgo },
            status: 'APPROVED'
        },
        select: { joinedAt: true }
    });

    const growthMap: Record<string, { count: number }> = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        growthMap[d.toISOString().split('T')[0]] = { count: 0 };
    }

    recentParticipations.forEach(p => {
        const day = p.joinedAt.toISOString().split('T')[0];
        if (growthMap[day]) growthMap[day].count++;
    });

    const growthData = Object.entries(growthMap)
        .map(([name, data]) => ({ 
            name: formatDay(name), 
            count: data.count 
        }))
        .reverse();

    return {
        totalEvents,
        totalParticipations,
        pendingInvitations,
        totalAttendees,
        totalRevenue: revenueData._sum.amount || 0,
        ticketSales: totalAttendees,
        growthData
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

const changeUserRole = async (userId: string, role: 'USER' | 'ORGANIZER' | 'ADMIN') => {
    const result = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, name: true, role: true }
    });
    return result;
};

const deleteUser = async (userId: string) => {
    const result = await prisma.user.delete({
        where: { id: userId }
    });
    return result;
};

const getGlobalStats = async () => {
    const [totalUsers, totalEvents, totalRevenue, totalParticipants] = await Promise.all([
        prisma.user.count(),
        prisma.event.count(),
        prisma.payment.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true }
        }),
        prisma.eventParticipant.count({ where: { status: 'APPROVED' } })
    ]);

    // Calculate growth for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentUsers, recentEvents] = await Promise.all([
        prisma.user.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true }
        }),
        prisma.event.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true }
        })
    ]);

    // Group by day
    const growthMap: Record<string, { users: number; events: number }> = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        growthMap[d.toISOString().split('T')[0]] = { users: 0, events: 0 };
    }

    recentUsers.forEach(u => {
        const day = u.createdAt.toISOString().split('T')[0];
        if (growthMap[day]) growthMap[day].users++;
    });

    recentEvents.forEach(e => {
        const day = e.createdAt.toISOString().split('T')[0];
        if (growthMap[day]) growthMap[day].events++;
    });

    const growthData = Object.entries(growthMap)
        .map(([name, data]) => ({ 
            name: formatDay(name), 
            users: data.users,
            events: data.events
        }))
        .reverse();

    return {
        totalUsers,
        totalEvents,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalParticipants,
        growthData
    };
};

function formatDay(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export const UserService = {
    getAllUsers,
    getUserById,
    getUserDashboardStats,
    updateProfile,
    changeUserRole,
    deleteUser,
    getGlobalStats
};
