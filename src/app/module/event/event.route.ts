import express from 'express';
import { EventController } from './event.controller';

import requireAuth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), EventController.createEvent);
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);
router.get('/:id/management', requireAuth(Role.ORGANIZER, Role.ADMIN), EventController.getManagementData);
router.patch('/:id', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), EventController.updateEvent);
router.delete('/:id', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), EventController.deleteEvent);
router.patch('/:id/toggle-featured', requireAuth(Role.ADMIN), EventController.toggleFeatured);

export const EventRoutes = router;
