import { Request, Response } from 'express';
import { NotificationService } from './notification.service';

const getUserNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await NotificationService.getUserNotifications(userId);
        res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully",
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
