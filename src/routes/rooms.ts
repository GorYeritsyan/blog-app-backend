import { Router } from "express";
import roomController from "../controllers/room.controller.js";
import auth from "../middlewares/auth.middleware.js";
import validateId from "../middlewares/validate-id.middleware.js";

const router = Router();

// Get current user all rooms
router.get("/", auth, roomController.getAllRooms);

router.get("/:id", auth, validateId, roomController.getRoomById);

router.post("/", auth, roomController.createRoom);

router.patch("/:id", auth, validateId, roomController.updateRoom);

// Remove room by id
router.delete("/:id", auth, validateId, roomController.removeRoom);

// Leave room by room id
router.delete("/:id/leave", auth, validateId, roomController.leaveRoom);

export default router;