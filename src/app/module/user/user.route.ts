import express from 'express';
import { UserController } from './user.controller';

import requireAuth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.get('/dashboard-stats', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), UserController.getDashboardStats);
router.patch('/me', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), UserController.updateProfile);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);

export const UserRoutes = router;
