import express from 'express';
import { InvitationController } from './invitation.controller';
import requireAuth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/invite', requireAuth(Role.ORGANIZER, Role.ADMIN), InvitationController.inviteUser);
router.get('/my-invitations', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), InvitationController.getMyInvitations);
router.patch('/:id/status', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), InvitationController.updateStatus);

export const InvitationRoutes = router;
