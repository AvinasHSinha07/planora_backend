import express from 'express';
import { ReviewController } from './review.controller';

import requireAuth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/', requireAuth(Role.USER, Role.ORGANIZER), ReviewController.createReview);
router.get('/my-reviews', requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN), ReviewController.getMyReviews);
router.get('/event/:eventId', ReviewController.getEventReviews);

export const ReviewRoutes = router;
