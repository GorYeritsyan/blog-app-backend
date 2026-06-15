import { Router } from "express";
import roomController from "../controllers/room.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", auth, roomController.getAllRooms);

export default router;