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
            const { message: reply, checkoutUrl } = await aiChatService.generateReply(conversation.id, req.userId!);
            const assistantMessage = await aiChatService.saveMessage({ conversationId: conversation.id, role: "ASSISTANT", status: "OK", content: reply.content! });

            res.status(201).json({ success: true, data: { message: assistantMessage, checkoutUrl } });
        } catch (error) {
            console.error("AI generation failed:", error);

            // Distinguish user-facing cause vs internal failure
            const isRateLimit = error instanceof BadRequestError;
            const fallbackContent = isRateLimit
                ? "We're getting a lot of requests right now — please try again in a moment."
                : "Sorry, I couldn't process that. Please try again.";

            const errorMessage = await aiChatService.saveMessage({
                conversationId: conversation.id,
                role: "ASSISTANT",
                status: "ERROR",
                content: fallbackContent,
            });

            // Still succeeds at the HTTP level — the "failure" is inside the conversation, not the request
            return res.status(201).json({ success: true, data: errorMessage });
        }
    }

    async removeConversation(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;

        const removedConversation = await aiChatService.removeConversation({ conversationId: +id, userId: req.userId! });

        res.status(200).json({ success: true, data: removedConversation });
    }
}

export default new AiChatController();