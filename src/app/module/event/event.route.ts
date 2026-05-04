import express from 'express';
import { EventController } from './event.controller';

import requireAuth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/', requireAuth(Role.USER, Role.ORGANIZER), EventController.createEvent);
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);
router.patch('/:id', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), EventController.updateEvent);
router.delete('/:id', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), EventController.deleteEvent);

export const EventRoutes = router;
