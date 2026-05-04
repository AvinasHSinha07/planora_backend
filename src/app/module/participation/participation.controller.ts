import { Request, Response } from 'express';
import { ParticipationService } from './participation.service';

const joinEvent = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.body;
        
        const userId = (req as any).user.id; 
        
        const result = await ParticipationService.joinEvent(userId, eventId);
        res.status(201).json({
            success: true,
            message: "Successfully joined event",
            data: result
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ 
            success: false, 
            message: error.message || "Failed to join event", 
            error 
        });
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

const removeParticipant = async (req: Request, res: Response) => {
    try {
        const result = await ParticipationService.removeParticipant(req.params.id as string);
        res.status(200).json({
            success: true,
            message: "Participant removed",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to remove participant", error });
    }
};

const getMyParticipations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await ParticipationService.getMyParticipations(userId);
        res.status(200).json({
            success: true,
            message: "My participations retrieved",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to get participations", error });
    }
};

export const ParticipationController = {
    joinEvent,
    updateStatus,
    getParticipants,
    getMyParticipations,
    removeParticipant,
};
