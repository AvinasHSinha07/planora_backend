import { NextFunction, Request, Response } from 'express';
import { EventService } from './event.service';

const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const result = await EventService.createEvent({
            ...req.body,
            organizerId: user.id
        });
        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await EventService.getAllEvents(req.query);
        res.status(200).json({
            success: true,
            message: "Events retrieved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getEventById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await EventService.getEventById(req.params.id as string);
        res.status(200).json({
            success: true,
            message: "Event retrieved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const result = await EventService.updateEvent(
            req.params.id as string, 
            req.body,
            user.id,
            user.role
        );
        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        await EventService.deleteEvent(
            req.params.id as string,
            user.id,
            user.role
        );
        res.status(200).json({
            success: true,
            message: "Event deleted successfully",
            data: null
        });
    } catch (error) {
        next(error);
    }
};

const getManagementData = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await EventService.getEventManagementData(req.params.id as string, userId);
        res.status(200).json({
            success: true,
            message: "Management data retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ 
            success: false, 
            message: error.message || "Failed to fetch management data", 
            error 
        });
    }
};

const toggleFeatured = async (req: Request, res: Response) => {
    try {
        const result = await EventService.toggleFeatured(req.params.id as string);
        res.status(200).json({
            success: true,
            message: "Event featured status updated",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to toggle featured status", error });
    }
};

export const EventController = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getManagementData,
    toggleFeatured
};
