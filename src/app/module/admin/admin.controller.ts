import { Request, Response } from 'express';
import { AdminService } from './admin.service';

const getStats = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.getPlatformStats();
        res.status(200).json({ success: true, message: "Stats retrieved", data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to fetch stats", error });
    }
};

const deleteUser = async (req: Request, res: Response) => {
    try {
        await AdminService.deleteUser(req.params.id as string);
        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to delete user", error });
    }
};

const featureEvent = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.featureEvent(req.params.id as string, req.body.isFeatured);
        res.status(200).json({ success: true, message: "Event featured status updated", data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to update event", error });
    }
};

export const AdminController = {
    getStats,
    deleteUser,
    featureEvent
};
