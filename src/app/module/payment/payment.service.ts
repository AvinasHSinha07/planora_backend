import Stripe from 'stripe';
import { envVars } from '../../config/env';
import { prisma } from '../../lib/prisma';
import AppError from '../../errorHelpers/AppError';
import status from 'http-status';
import { NotificationService } from '../notification/notification.service';

const stripe = new Stripe(envVars.STRIPE_SECRET_KEY);

const createPaymentSession = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(status.NOT_FOUND, 'Event not found');
  if (event.fee <= 0) throw new AppError(status.BAD_REQUEST, 'Event is free');

  if (event.organizerId === userId) {
    throw new AppError(status.BAD_REQUEST, "You are the organizer of this event");
  }

  const existingParticipant = await prisma.eventParticipant.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId
      }
    }
  });

  if (existingParticipant && existingParticipant.status === 'APPROVED') {
    throw new AppError(status.BAD_REQUEST, "You have already joined this event");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: event.title,
            description: `Payment for joining ${event.title}`,
          },
          unit_amount: Math.round(event.fee * 100), // convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${envVars.CLIENT_URL}/dashboard/participations?payment=success`,
    cancel_url: `${envVars.CLIENT_URL}/events/${eventId}?payment=cancelled`,
    metadata: {
      eventId,
      userId,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      userId,
      eventId,
      amount: event.fee,
      stripeSessionId: session.id,
      status: 'PENDING',
    },
  });

  return { url: session.url, paymentId: payment.id };
};

const handleWebhook = async (payload: Buffer, sig: string) => {
  const endpointSecret = envVars.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    throw new AppError(status.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    if (session.metadata?.eventId && session.metadata?.userId) {
      await prisma.$transaction(async (tx: any) => {
        // Update payment status
        await tx.payment.update({
          where: { stripeSessionId: session.id },
          data: { status: 'COMPLETED' },
        });

        // Add to participants as pending (requires approval if private, else approved)
        const dbEvent = await tx.event.findUnique({ where: { id: session.metadata!.eventId } });
        const pStatus = dbEvent?.eventType === 'PUBLIC_PAID' ? 'APPROVED' : 'PENDING';

        await tx.eventParticipant.upsert({
          where: {
            userId_eventId: {
              userId: session.metadata!.userId,
              eventId: session.metadata!.eventId,
            }
          },
          update: { status: pStatus },
          create: {
            userId: session.metadata!.userId,
            eventId: session.metadata!.eventId,
            status: pStatus,
          }
        });

        // Notify User
        await NotificationService.createNotification(
            session.metadata!.userId,
            "Payment Successful",
            `Your payment for "${dbEvent?.title}" has been processed. Your participation is now ${pStatus.toLowerCase()}.`
        );
      });
    }
  }

  return { received: true };
};

export const PaymentService = {
  createPaymentSession,
  handleWebhook,
};
