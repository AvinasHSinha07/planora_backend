import express from 'express';
import { AdminController } from './admin.controller';
import requireAuth from '../../middleware/auth';

const router = express.Router();

router.get('/stats', requireAuth('ADMIN'), AdminController.getStats);
router.get('/users', requireAuth('ADMIN'), AdminController.getUsers);
router.get('/events', requireAuth('ADMIN'), AdminController.getEvents);
router.delete('/users/:id', requireAuth('ADMIN'), AdminController.deleteUser);
router.delete('/events/:id', requireAuth('ADMIN'), AdminController.deleteEvent);
router.patch('/events/:id/feature', requireAuth('ADMIN'), AdminController.featureEvent);

export const AdminRoutes = router;
