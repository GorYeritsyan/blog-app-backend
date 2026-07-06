import { Router } from "express";
import roomController from "../controllers/room.controller.js";
import validateId from "../middlewares/validate-id.middleware.js";

const router = Router();

// Get current user all rooms
router.get("/", roomController.getAllRooms);

router.get("/:id", validateId, roomController.getRoomById);

router.post("/", roomController.createRoom);

router.patch("/:id", validateId, roomController.updateRoom);

// Remove room by id
router.delete("/:id", validateId, roomController.removeRoom);

// Leave room by room id
router.delete("/:id/leave", validateId, roomController.leaveRoom);

export default router;