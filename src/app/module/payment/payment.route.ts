import express from 'express';
import { PaymentController } from './payment.controller';

import requireAuth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/create-session', requireAuth(Role.USER, Role.ORGANIZER), PaymentController.createSession);
router.get('/verify-session', requireAuth(Role.USER, Role.ORGANIZER), PaymentController.verifySession);
router.get('/my-payments', requireAuth(Role.USER, Role.ORGANIZER), PaymentController.getMyPayments);
router.get('/organizer-payments', requireAuth(Role.ORGANIZER, Role.ADMIN), PaymentController.getOrganizerPayments);
router.get('/all-payments', requireAuth(Role.ADMIN), PaymentController.getAllPayments);

export const PaymentRoutes = router;
