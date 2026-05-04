import { Request, Response } from 'express';
import { EventService } from './event.service';

const createEvent = async (req: Request, res: Response) => {
    try {
        const result = await EventService.createEvent(req.body);
        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to create event", error });
    }
};

const getAllEvents = async (req: Request, res: Response) => {
    try {
        const result = await EventService.getAllEvents(req.query);
        res.status(200).json({
            success: true,
            message: "Events retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to retrieve events", error });
    }
};

const getEventById = async (req: Request, res: Response) => {
    try {
        const result = await EventService.getEventById(req.params.id as string);
        res.status(200).json({
            success: true,
            message: "Event retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(404).json({ success: false, message: "Event not found", error });
    }
};

const updateEvent = async (req: Request, res: Response) => {
    try {
        const result = await EventService.updateEvent(req.params.id as string, req.body);
        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to update event", error });
    }
};

const deleteEvent = async (req: Request, res: Response) => {
    try {
        await EventService.deleteEvent(req.params.id as string);
        res.status(200).json({
            success: true,
            message: "Event deleted successfully",
            data: null
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to delete event", error });
    }
};

export const EventController = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
};
