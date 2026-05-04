import express from 'express';
import { ParticipationController } from './participation.controller';

import requireAuth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.get('/my-participations', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), ParticipationController.getMyParticipations);
router.post('/join', requireAuth(Role.USER, Role.ORGANIZER), ParticipationController.joinEvent);
router.patch('/:id/status', requireAuth(Role.ORGANIZER, Role.ADMIN), ParticipationController.updateStatus);
router.get('/:eventId/participants', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), ParticipationController.getParticipants);
router.delete('/:id', requireAuth(Role.ORGANIZER, Role.ADMIN), ParticipationController.removeParticipant);

export const ParticipationRoutes = router;
