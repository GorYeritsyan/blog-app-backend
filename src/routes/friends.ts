import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import friendController from "../controllers/friend.controller.js";
import validateId from "../middlewares/validate-id.middleware.js";

const router = Router();

router.get("/", auth, friendController.getAllRequests);

router.get("/accepted", auth, friendController.getFriends);

router.get("/incoming", auth, friendController.getIncomingRequests);

// POST - /api/friends
router.post("/", auth, friendController.sendFriendRequest);

// PATCH - /api/friends/accept/:id
router.patch("/accept/:id", auth, validateId, friendController.acceptFriendRequest);

// PATCH - /api/friends/reject/:id
router.patch("/reject/:id", auth, validateId, friendController.rejectFriendRequest);

// DELETE - /api/friends
router.delete("/:id", auth, validateId, friendController.removeFriend);

export default router;