import { Request, Response } from 'express';
import { UserService } from './user.service';

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllUsers(req.query);
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
        const userRole = (req as any).user.role;
        
        let result;
        if (userRole === 'ADMIN') {
            result = await UserService.getGlobalStats();
        } else {
            result = await UserService.getUserDashboardStats(userId);
        }

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

const changeUserRole = async (req: Request, res: Response) => {
    try {
        const { userId, role } = req.body;
        const result = await UserService.changeUserRole(userId, role);
        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to update role", error });
    }
};

const deleteUser = async (req: Request, res: Response) => {
    try {
        const result = await UserService.deleteUser(req.params.id as string);
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to delete user", error });
    }
};

export const UserController = {
    getAllUsers,
    getUserById,
    getDashboardStats,
    updateProfile,
    changeUserRole,
    deleteUser,
};
