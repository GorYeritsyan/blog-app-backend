import { Router } from "express";
import aiChatController from "../controllers/ai-chat.controller.js";

const router = Router();

// GET /api/chat/conversations
router.get("/conversations", aiChatController.getAllConversations);

// GET /api/chat/conversations/:id
router.get("/conversations/:id", aiChatController.getConversation);

// POST /api/chat/messages
router.post("/messages", aiChatController.sendMessage);

// DELETE /api/chat/conversations/:id
router.delete("/conversations/:id", aiChatController.removeConversation);

export default router;