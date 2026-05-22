import { Request, Response } from "express";
import userService from "../services/user.service.js";
import {AuthRequest, PaginatedQuery, type Pagination} from "../types/types.js";

class UserController {
    async getAllUsers(req: AuthRequest<{}, {}, {}, PaginatedQuery>, res: Response) {
        const { query = "", page = "1", limit = "10", orderBy = "createdAt", order = "desc" } = req.query;
        const { users, totalPages } = await userService.getAllUsers({ query, page, limit, orderBy, order, authorId: req.userId });

        // Pagination
        const pagination: Pagination = { currentPage: +page, totalPages, hasNext: +page < totalPages, hasPrev: +page > 1 };

        res.json({
            success: true,
            data: { items: users, pagination }
        });
    }
}

export default new UserController();