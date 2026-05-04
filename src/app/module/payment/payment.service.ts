import Stripe from 'stripe';
import { envVars } from '../../config/env';
import { prisma } from '../../lib/prisma';
import AppError from '../../errorHelpers/AppError';
import status from 'http-status';

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

  const clientUrl = envVars.CLIENT_URL.split(',')[0].trim();

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
    success_url: `${clientUrl}/dashboard/participations?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/events/${eventId}?payment=cancelled`,
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

const processSuccessfulSession = async (session: any) => {
  if (session.metadata?.eventId && session.metadata?.userId) {
    const { eventId, userId } = session.metadata;

    await prisma.$transaction(async (tx) => {
      // Update payment status if still pending
      const payment = await tx.payment.findUnique({ where: { stripeSessionId: session.id } });
      if (payment && payment.status === 'PENDING') {
          await tx.payment.update({
            where: { stripeSessionId: session.id },
            data: { status: 'COMPLETED' },
          });
      }

      // Add to participants as pending (requires approval if private, else approved)
      const dbEvent = await tx.event.findUnique({ where: { id: eventId } });
      if (!dbEvent) throw new Error('Event not found during processing');

      const pStatus = dbEvent.eventType === 'PUBLIC_PAID' ? 'APPROVED' : 'PENDING';

      await tx.eventParticipant.upsert({
        where: {
          userId_eventId: { userId, eventId }
        },
        update: { status: pStatus },
        create: {
          userId,
          eventId,
          status: pStatus,
        }
      });

      // Notify User
      await tx.notification.create({
          data: {
              userId,
              title: "Payment Successful",
              message: `Your payment for "${dbEvent.title}" has been processed. Your participation is now ${pStatus.toLowerCase()}.`
          }
      });

      // Notify Organizer
      const participantUser = await tx.user.findUnique({ where: { id: userId } });
      await tx.notification.create({
          data: {
              userId: dbEvent.organizerId,
              title: "New Paid Participation",
              message: `${participantUser?.name || "A user"} has joined your event "${dbEvent.title}" after successful payment.`
          }
      });
    });
  }
};

const handleWebhook = async (payload: Buffer, sig: string) => {
  const endpointSecret = envVars.STRIPE_WEBHOOK_SECRET;
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    throw new AppError(status.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }

  if (stripeEvent.type === 'checkout.session.completed' || stripeEvent.type === 'checkout.session.async_payment_succeeded') {
    const session = stripeEvent.data.object as any;
    await processSuccessfulSession(session);
  }

  return { received: true };
};

const verifySession = async (sessionId: string) => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
        await processSuccessfulSession(session);
        return { success: true };
    }
    return { success: false };
};

const getMyPayments = async (userId: string) => {
    const result = await prisma.payment.findMany({
        where: { userId },
        include: {
            event: {
                include: {
                    category: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return result;
};

const getOrganizerPayments = async (organizerId: string) => {
    const result = await prisma.payment.findMany({
        where: {
            event: {
                organizerId
            }
        },
        include: {
            event: {
                include: {
                    category: true,
                }
            },
            user: {
                select: {
                    name: true,
                    email: true,
                    avatar: true,
                    image: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return result;
};

const getAllPayments = async () => {
    const result = await prisma.payment.findMany({
        include: {
            event: {
                include: {
                    category: true,
                    organizer: {
                        select: {
                            name: true,
                            email: true,
                        }
                    }
                }
            },
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return result;
};

export const PaymentService = {
  createPaymentSession,
  handleWebhook,
  verifySession,
  getMyPayments,
  getOrganizerPayments,
  getAllPayments,
};
