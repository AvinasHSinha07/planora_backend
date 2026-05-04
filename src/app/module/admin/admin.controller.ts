import { NextFunction, Request, Response } from 'express';
import { AdminService } from './admin.service';

const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminService.getPlatformStats();
        res.status(200).json({ success: true, message: "Stats retrieved", data: result });
    } catch (error) {
        next(error);
    }
};

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminService.getAllUsers();
        res.status(200).json({ success: true, message: "Users retrieved", data: result });
    } catch (error) {
        next(error);
    }
};

const getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminService.getAllEvents();
        res.status(200).json({ success: true, message: "Events retrieved", data: result });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AdminService.deleteUser(req.params.id as string);
        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        next(error);
    }
};

const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AdminService.deleteEvent(req.params.id as string);
        res.status(200).json({ success: true, message: "Event deleted" });
    } catch (error) {
        next(error);
    }
};

const featureEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminService.featureEvent(req.params.id as string, req.body.isFeatured);
        res.status(200).json({ success: true, message: "Event featured status updated", data: result });
    } catch (error) {
        next(error);
    }
};

const getRevenueAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminService.getRevenueStats();
        res.status(200).json({ success: true, message: "Revenue analytics retrieved", data: result });
    } catch (error) {
        next(error);
    }
};

export const AdminController = {
    getStats,
    getRevenueAnalytics,
    getUsers,
    getEvents,
    deleteUser,
    deleteEvent,
    featureEvent
};
