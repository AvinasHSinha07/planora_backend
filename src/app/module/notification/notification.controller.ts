import { Request, Response } from 'express';
import { NotificationService } from './notification.service';

const getUserNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || req.params.userId; // Mocked auth
        const result = await NotificationService.getUserNotifications(userId as string);
        res.status(200).json({
            success: true,
            message: "Notifications retrieved",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to get notifications", error });
    }
};

const markAsRead = async (req: Request, res: Response) => {
    try {
        const result = await NotificationService.markAsRead(req.params.id as string);
        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to mark as read", error });
    }
};

export const NotificationController = {
    getUserNotifications,
    markAsRead
};
