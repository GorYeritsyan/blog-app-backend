import { Response } from "express";
import {AuthRequest, PaginatedQuery, Pagination} from "../types/types.js";
import orderService from "../services/order.service.js";

class OrderController {
    async getAllOrders(req: AuthRequest<{}, {}, {}, PaginatedQuery>, res: Response) {
        const { query = "", page = "1", limit = "10", orderBy = "createdAt", order = "desc" } = req.query;
        const currentUserId = req.userId;

        const { orders, totalPages } = await orderService.getAllOrders({
            query,
            page,
            limit,
            orderBy,
            order,
            userId: currentUserId!,
        });

        // Pagination
        const pagination: Pagination = { currentPage: +page, totalPages, hasNext: +page < totalPages, hasPrev: +page > 1 };

        res.status(200).json({
            success: true,
            data: {
                items: orders,
                pagination,
            }
        });
    }

    async getOrderById(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;
        const currentUserId = req.userId;

        const order = await orderService.getOrderById({ orderId: +id, userId: currentUserId! });

        res.status(200).json({ success: true, data: order });
    }
}

export default new OrderController();