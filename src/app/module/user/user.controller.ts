import { Request, Response } from 'express';
import { UserService } from './user.service';

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllUsers();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to retrieve users", error });
    }
};

const getUserById = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getUserById(req.params.id as string);
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(404).json({ success: false, message: "User not found", error });
    }
};

const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await UserService.getUserDashboardStats(userId);
        res.status(200).json({
            success: true,
            message: "Dashboard stats retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to fetch dashboard stats", error });
    }
};

const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await UserService.updateProfile(userId, req.body);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to update profile", error });
    }
};

export const UserController = {
    getAllUsers,
    getUserById,
    getDashboardStats,
    updateProfile,
};
