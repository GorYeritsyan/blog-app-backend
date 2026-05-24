import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import friendController from "../controllers/friend.controller.js";

const router = Router();

router.get("/", auth, friendController.getAllRequests);

router.get("/incoming", auth, friendController.getIncomingRequests);

// POST - /api/friends
router.post("/", auth, friendController.sendFriendRequest);

// PATCH - /api/friends/accept/:id
router.patch("/accept/:id", friendController.acceptFriendRequest);

router.delete("/:id", auth, friendController.deleteRequest);

export default router;