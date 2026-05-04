import { Request, Response } from 'express';
import { PaymentService } from './payment.service';

const createSession = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.body;
        const userId = (req as any).user.id;
        const result = await PaymentService.createPaymentSession(eventId, userId);
        res.status(200).json({
            success: true,
            message: "Payment session created",
            data: result
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ 
            success: false, 
            message: error.message || "Failed to create payment session", 
            error 
        });
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

const verifySession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.query;
        const result = await PaymentService.verifySession(sessionId as string);
        res.status(200).json({
            success: true,
            message: "Session verified",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to verify session", error });
    }
};

export const PaymentController = {
    createSession,
    handleWebhook,
    verifySession
};
