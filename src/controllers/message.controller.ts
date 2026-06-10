import { type Request, type Response } from "express";
import messageService from "../services/message.service.js";
import {AuthRequest, type Pagination} from "../types/types.js";
import userService from "../services/user.service.js";
import friendService from "../services/friend.service.js";

class MessageController {
    async getMessages(req: AuthRequest<{ id: string }, {}, {}, { page?: string; limit?: string }>, res: Response) {
        const { id } = req.params;
        const { page = "1", limit = "10" } = req.query;
        const currentUserId = req.userId;

        const { data, totalPages } = await messageService.getMessages({
            currentUserId: currentUserId!,
            friendId: +id,
            page,
            limit
        });

        // Create pagination - todo create pagination utility function to create similar structure
        const pagination: Pagination = { currentPage: +page, totalPages, hasNext: +page < totalPages, hasPrev: +page > 1 };

        res.status(200).json({
            success: true,
            data: { items: data, pagination }
        });
    }

    // Send message controller
    async sendMessage(req: AuthRequest<{ id: string }, {}, { content: string }>, res: Response) {
        const { id } = req.params;
        const { content } = req.body;
        const currentUserId = req.userId;

        const sentMessage = await messageService.sendMessage({ currentUserId: currentUserId!, friendId: +id, content });

        console.log("Sent Message", sentMessage);

        res.json({ success: true, data: sentMessage });
    }
}

export default new MessageController();