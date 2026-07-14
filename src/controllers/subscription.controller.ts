import subscriptionService from "../services/subscription.service.js";
import {AuthRequest} from "../types/types.js";
import {Response} from "express";
import customerService from "../services/customer.service.js";

class SubscriptionController {
    async getUserSubscription(req: AuthRequest, res: Response) {
        const userId = req.userId;
        const subscription = await subscriptionService.getUserSubscription(userId!);

        res.status(200).json({ success: true, data: subscription });
    }

    async createBillingPortalSession(req: AuthRequest, res: Response) {
        const userId = req.userId;

        // Create customer or get customer if already created
        const customerId = await customerService.upsertStripeCustomer(userId!);

        const session = await subscriptionService.createBillingPortalSession(customerId);

        res.status(200).json({ success: true, data: session });
    }
}

export default new SubscriptionController();