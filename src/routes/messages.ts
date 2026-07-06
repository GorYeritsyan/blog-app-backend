import { Router } from "express";
import messageController from "../controllers/message.controller.js";
import auth from "../middlewares/auth.middleware.js";
import validateId from "../middlewares/validate-id.middleware.js";

const router = Router();

// GET - /api/messages/friendId
router.get("/:id", validateId, messageController.getMessages);

// POST - /api/messages/friendId
router.post("/:id", validateId, messageController.sendMessage);

export default router;