import { prisma } from "../../lib/prisma";

const createNotification = async (userId: string, title: string, message: string) => {
    const result = await prisma.notification.create({
        data: {
            userId,
            title,
            message,
        }
    });
    return result;
};

const getUserNotifications = async (userId: string) => {
    const result = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    return result;
};

const markAsRead = async (id: string) => {
    const result = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });
    return result;
};

const markAllAsRead = async (userId: string) => {
    const result = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
    return result;
};

export const NotificationService = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
};
