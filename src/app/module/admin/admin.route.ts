import express from 'express';
import { AdminController } from './admin.controller';
import requireAuth from '../../middleware/auth';

const router = express.Router();

router.get('/stats', requireAuth('ADMIN'), AdminController.getStats);
router.delete('/users/:id', requireAuth('ADMIN'), AdminController.deleteUser);
router.patch('/events/:id/feature', requireAuth('ADMIN'), AdminController.featureEvent);

export const AdminRoutes = router;
