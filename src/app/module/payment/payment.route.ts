import express from 'express';
import { PaymentController } from './payment.controller';

import requireAuth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/create-session', requireAuth(Role.USER, Role.ORGANIZER), PaymentController.createSession);

export const PaymentRoutes = router;
