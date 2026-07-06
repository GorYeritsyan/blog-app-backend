import { Response } from 'express';

import {AuthRequest, CartItem} from "../types/types.js";
import checkoutService from "../services/checkout.service.js";
import customerService from "../services/customer.service.js";

class CheckoutController {
    async createCheckoutSession(req: AuthRequest<{}, {}, { items: CartItem[] }>, res: Response) {
        const { items } = req.body;
        const userId = req.userId;

        // Create customer or get customer if already created
        const customerId = await customerService.upsertStripeCustomer(userId!);

        const session = await checkoutService.createCheckoutSession({ items, userId: userId!, customerId });

        res.json({ success: true, data: session });
    }

    async getCheckoutSession(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;
        const session = await checkoutService.getCheckoutSession(id);

        res.status(200).json({ success: true, data: session });
    }
}

export default new CheckoutController();