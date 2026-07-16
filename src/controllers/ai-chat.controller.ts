import aiChatService from "../services/ai-chat.service.js";
import {AuthRequest} from "../types/types.js";
import {Response} from "express";
import {BadRequestError} from "../errors/index.js";

class AiChatController {
    async getAllConversations(req: AuthRequest, res: Response) {
        const userId = req.userId;

        const conversations = await aiChatService.getAllConversations(userId!);

        res.status(200).json({ success: true, data: conversations });
    }

    async getConversation(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;

        const conversation = await aiChatService.getConversation({ conversationId: +id, userId: req.userId! });

        res.status(200).json({ success: true, data: conversation });
    }

    // todo: refactor logic
    async sendMessage(req: AuthRequest<{}, {}, { conversationId: number; content: string }>, res: Response) {
        const { conversationId, content } = req.body;

        if (!content.trim()) throw new BadRequestError("Message content is required");

        // get conversation
        const conversation = await aiChatService.getOrCreateConversation({ userId: req.userId!, conversationId });

        // save user message in db
        const userMessage = await aiChatService.saveMessage({ conversationId, content, role: "USER" });



        // generate AI response and save it in the db

        res.status(201).json({ success: true });
    }
}

export default new AiChatController();