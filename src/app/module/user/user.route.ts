import express from 'express';
import { UserController } from './user.controller';

import requireAuth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.get('/dashboard-stats', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), UserController.getDashboardStats);
router.patch('/me', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), UserController.updateProfile);
router.get('/', requireAuth(Role.ADMIN), UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.delete('/:id', requireAuth(Role.ADMIN), UserController.deleteUser);
router.patch('/change-role', requireAuth(Role.ADMIN), UserController.changeUserRole);

export const UserRoutes = router;
