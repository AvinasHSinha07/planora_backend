import { Request, Response } from 'express';
import { PaymentService } from './payment.service';

const createSession = async (req: Request, res: Response) => {
    try {
        const { eventId, userId } = req.body;
        const result = await PaymentService.createPaymentSession(eventId, userId);
        res.status(200).json({
            success: true,
            message: "Payment session created",
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create payment session", error });
    }
};

const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    
    try {
        const result = await PaymentService.handleWebhook(req.body, sig);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).send(`Webhook Error`);
    }
};

export const PaymentController = {
    createSession,
    handleWebhook
};
