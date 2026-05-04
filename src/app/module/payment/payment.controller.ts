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

const getMyPayments = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await PaymentService.getMyPayments(userId);
        res.status(200).json({
            success: true,
            message: "Payments retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to retrieve payments", error });
    }
};

const getOrganizerPayments = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await PaymentService.getOrganizerPayments(userId);
        res.status(200).json({
            success: true,
            message: "Organizer payments retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to retrieve organizer payments", error });
    }
};

const getAllPayments = async (req: Request, res: Response) => {
    try {
        const result = await PaymentService.getAllPayments();
        res.status(200).json({
            success: true,
            message: "All payments retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to retrieve all payments", error });
    }
};

export const PaymentController = {
    createSession,
    handleWebhook,
    verifySession,
    getMyPayments,
    getOrganizerPayments,
    getAllPayments,
};
