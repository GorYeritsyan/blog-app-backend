import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import friendController from "../controllers/friend.controller.js";
import validateId from "../middlewares/validate-id.middleware.js";

const router = Router();

router.get("/", friendController.getAllRequests);

router.get("/accepted", friendController.getFriends);

router.get("/incoming", friendController.getIncomingRequests);

// POST - /api/friends
router.post("/", friendController.sendFriendRequest);

// PATCH - /api/friends/accept/:id
router.patch("/accept/:id", validateId, friendController.acceptFriendRequest);

// PATCH - /api/friends/reject/:id
router.patch("/reject/:id", validateId, friendController.rejectFriendRequest);

// DELETE - /api/friends
router.delete("/:id", validateId, friendController.removeFriend);

export default router;