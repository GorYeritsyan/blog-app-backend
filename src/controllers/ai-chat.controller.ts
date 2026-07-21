import aiChatService from "../services/ai-chat.service.js";
import {AuthRequest} from "../types/types.js";
import {Response} from "express";
import {AppError, BadRequestError} from "../errors/index.js";

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
        await aiChatService.saveMessage({ conversationId: conversation.id, content, role: "USER" });

        // generate AI response and save it in the db
        try {
            const reply = await aiChatService.generateReply(conversation.id, req.userId!);
            const assistantMessage = await aiChatService.saveMessage({ conversationId: conversation.id, role: "ASSISTANT", status: "OK", content: reply.content! });

            res.status(201).json({ success: true, data: assistantMessage });
        } catch (error) {
            console.error("AI generation failed: ", error);

            const errorMessage = await aiChatService.saveMessage({ conversationId: conversation.id, role: "ASSISTANT", status: "ERROR", content: "Sorry, I couldn't process that. Please try again." });

            throw new AppError(errorMessage.content, 500);
        }
    }
}

export default new AiChatController();