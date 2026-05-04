import express from 'express';
import { NotificationController } from './notification.controller';

import requireAuth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.get('/', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), NotificationController.getUserNotifications);
router.patch('/:id/read', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), NotificationController.markAsRead);

export const NotificationRoutes = router;
