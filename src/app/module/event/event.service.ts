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
    const { searchTerm, category, type, limit, page, organizerId, status: eventStatus } = query;
    const where: any = {};

    if (eventStatus === 'upcoming') {
        where.date = { gte: new Date() };
    } else if (eventStatus === 'past') {
        where.date = { lt: new Date() };
    }

    if (organizerId) {
        where.organizerId = organizerId;
    }

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
        const types = type.split(',');
        if (types.length > 1) {
            where.eventType = { in: types };
        } else {
            where.eventType = type;
        }
    }

    const take = limit ? Number(limit) : 10;
    const skip = page ? (Number(page) - 1) * take : 0;

    const [result, total] = await Promise.all([
        prisma.event.findMany({
            where,
            include: {
                category: true,
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        image: true,
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                                image: true
                            }
                        }
                    }
                }
            },
            take,
            skip,
            orderBy: {
                date: 'asc'
            }
        }),
        prisma.event.count({ where })
    ]);

    return {
        events: result,
        meta: {
            total,
            page: page ? Number(page) : 1,
            limit: take,
            totalPages: Math.ceil(total / take)
        }
    };
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
                    image: true,
                }
            },
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            image: true
                        }
                    }
                }
            },
            reviews: {
                include: {
                    user: {
                        select: {
                            name: true,
                            avatar: true,
                            image: true
                        }
                    }
                }
            }
        }
    });

    if (!result) {
        throw new AppError(status.NOT_FOUND, "Event not found");
    }

    const relatedEvents = await prisma.event.findMany({
        where: {
            categoryId: result.categoryId,
            id: { not: result.id }
        },
        take: 3,
        include: {
            category: true,
            organizer: {
                select: {
                    name: true,
                    avatar: true,
                    image: true
                }
            }
        }
    });

    return {
        ...result,
        relatedEvents
    };
};

const updateEvent = async (id: string, payload: any, userId: string, userRole: string) => {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
        throw new AppError(status.NOT_FOUND, "Event not found");
    }

    // Only owner or admin can update
    if (event.organizerId !== userId && userRole !== 'ADMIN') {
        throw new AppError(status.FORBIDDEN, "You do not have permission to update this event");
    }

    const result = await prisma.event.update({
        where: { id },
        data: payload,
    });
    return result;
};

const deleteEvent = async (id: string, userId: string, userRole: string) => {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
        throw new AppError(status.NOT_FOUND, "Event not found");
    }

    // Only owner or admin can delete
    if (event.organizerId !== userId && userRole !== 'ADMIN') {
        throw new AppError(status.FORBIDDEN, "You do not have permission to delete this event");
    }

    const result = await prisma.event.delete({
        where: { id },
    });
    return result;
};

const getEventManagementData = async (eventId: string, userId: string) => {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            image: true
                        }
                    }
                }
            },
            invitations: {
                include: {
                    invitee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            image: true
                        }
                    }
                }
            }
        }
    });

    if (!event) throw new AppError(status.NOT_FOUND, "Event not found");
    if (event.organizerId !== userId) throw new AppError(status.FORBIDDEN, "Unauthorized");

    return event;
};

export const EventService = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventManagementData
};
