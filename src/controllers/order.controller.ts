import { Response } from "express";
import {AuthRequest} from "../types/types.js";
import orderService from "../services/order.service.js";

class OrderController {
    async getAllOrders(req: AuthRequest, res: Response) {
        const currentUserId = req.userId;

        const orders = await orderService.getAllOrders(currentUserId!);
        res.status(200).json({ success: true, data: orders });
    }

    async getOrderById(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;
        const currentUserId = req.userId;

        const order = await orderService.getOrderById({ orderId: +id, userId: currentUserId! });

        res.status(200).json({ success: true, data: order });
    }
}

export default new OrderController();