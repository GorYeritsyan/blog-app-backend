import { type Request, type Response } from "express";
import messageService from "../services/message.service.js";
import {AuthRequest} from "../types/types.js";
import userService from "../services/user.service.js";
import friendService from "../services/friend.service.js";

class MessageController {
    async getMessages(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;
        const currentUserId = req.userId;

        const messages = await messageService.getMessages({ currentUserId: currentUserId!, friendId: +id });

        console.log("Messages", messages);

        res.json({ success: true, data: [] });
    }

    // Send message controller
    async sendMessage(req: AuthRequest<{ id: string }, {}, { content: string }>, res: Response) {
        const { id } = req.params;
        const { content } = req.body;
        const currentUserId = req.userId;

        const sentMessage = await messageService.sendMessage({ currentUserId: currentUserId!, friendId: +id, content });

        console.log("Sent Message", sentMessage);

        res.json({ success: true, data: [] });
    }
}

export default new MessageController();