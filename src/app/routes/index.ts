import express from 'express';
import { UserRoutes } from '../module/user/user.route';
import { EventRoutes } from '../module/event/event.route';
import { ParticipationRoutes } from '../module/participation/participation.route';
import { PaymentRoutes } from '../module/payment/payment.route';
import { ReviewRoutes } from '../module/review/review.route';
import { NotificationRoutes } from '../module/notification/notification.route';
import { AdminRoutes } from '../module/admin/admin.route';
import { AiRoutes } from '../module/ai/ai.route';
import { CategoryRoutes } from '../module/category/category.route';
import { InvitationRoutes } from '../module/invitation/invitation.route';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/admin',
        route: AdminRoutes
    },
    {
        path: '/ai',
        route: AiRoutes
    },
    {
        path: '/categories',
        route: CategoryRoutes
    },
    {
        path: '/users',
        route: UserRoutes
    },
    {
        path: '/events',
        route: EventRoutes
    },
    {
        path: '/participations',
        route: ParticipationRoutes
    },
    {
        path: '/payments',
        route: PaymentRoutes
    },
    {
        path: '/reviews',
        route: ReviewRoutes
    },
    {
        path: '/notifications',
        route: NotificationRoutes
    },
    {
        path: '/invitations',
        route: InvitationRoutes
    }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
