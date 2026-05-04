import { Request, Response } from 'express';
import { ParticipationService } from './participation.service';

const joinEvent = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.body;
        // In reality, userId comes from authenticated req.user
        const userId = req.body.userId; 
        
        const result = await ParticipationService.joinEvent(userId, eventId);
        res.status(201).json({
            success: true,
            message: "Successfully joined event",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to join event", error });
    }
};

const updateStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const result = await ParticipationService.updateParticipantStatus(req.params.id as string, status);
        res.status(200).json({
            success: true,
            message: "Status updated",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to update status", error });
    }
};

const getParticipants = async (req: Request, res: Response) => {
    try {
        const result = await ParticipationService.getEventParticipants(req.params.eventId as string);
        res.status(200).json({
            success: true,
            message: "Participants retrieved",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to get participants", error });
    }
};

export const ParticipationController = {
    joinEvent,
    updateStatus,
    getParticipants
};
