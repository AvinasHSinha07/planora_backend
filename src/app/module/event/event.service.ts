import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const createEvent = async (data: any) => {
    const result = await prisma.event.create({
        data,
    });
    return result;
};

const getAllEvents = async (query: any) => {
    const { searchTerm, category, type } = query;
    const where: any = {};

    if (searchTerm) {
        where.OR = [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { venue: { contains: searchTerm, mode: 'insensitive' } },
        ];
    }

    if (category && category !== 'all') {
        where.category = { name: category };
    }

    if (type && type !== 'all') {
        where.eventType = type;
    }

    const result = await prisma.event.findMany({
        where,
        include: {
            category: true,
            organizer: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                }
            }
        }
    });
    return result;
};

const getEventById = async (id: string) => {
    const result = await prisma.event.findUnique({
        where: { id },
        include: {
            category: true,
            organizer: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                }
            },
            participants: true,
            reviews: true
        }
    });
    if (!result) {
        throw new AppError(status.NOT_FOUND, "Event not found");
    }
    return result;
};

const updateEvent = async (id: string, payload: any) => {
    const result = await prisma.event.update({
        where: { id },
        data: payload,
    });
    return result;
};

const deleteEvent = async (id: string) => {
    const result = await prisma.event.delete({
        where: { id },
    });
    return result;
};

export const EventService = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
};
