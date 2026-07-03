import { Response } from 'express';
import { AuthRequest } from "../types/types.js";
import checkoutService from "../services/checkout.service.js";
import { type CartItem } from "../generated/prisma/client.js";


class CheckoutController {
    async createCheckoutSession(req: AuthRequest<{}, {}, { items: CartItem[] }>, res: Response) {
        const { items } = req.body;
        const userId = req.userId;

        const session = await checkoutService.createCheckoutSession(items, userId!);
        console.log("Session", session);

        res.json({ success: true, data: session });
    }

    async getCheckoutSession(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;
        const session = await checkoutService.getCheckoutSession(id);

        res.status(200).json({ success: true, data: session });
    }
}

export default new CheckoutController();