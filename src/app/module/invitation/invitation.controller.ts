import { Request, Response } from 'express';
import { InvitationService } from './invitation.service';

const inviteUser = async (req: Request, res: Response) => {
    try {
        const inviterId = (req as any).user.id;
        const { eventId, email } = req.body;
        const result = await InvitationService.inviteUser(inviterId, eventId, email);
        res.status(201).json({
            success: true,
            message: "Invitation sent successfully",
            data: result
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ 
            success: false, 
            message: error.message || "Failed to send invitation", 
            error 
        });
    }
};

const getMyInvitations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await InvitationService.getMyInvitations(userId);
        res.status(200).json({
            success: true,
            message: "Invitations retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to fetch invitations", error });
    }
};

const updateStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { status } = req.body;
        const result = await InvitationService.updateInvitationStatus(userId, req.params.id as string, status);
        res.status(200).json({
            success: true,
            message: `Invitation ${status.toLowerCase()} successfully`,
            data: result
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ 
            success: false, 
            message: error.message || "Failed to update invitation status", 
            error 
        });
    }
};

export const InvitationController = {
    inviteUser,
    getMyInvitations,
    updateStatus
};
