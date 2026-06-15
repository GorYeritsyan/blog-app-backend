import { type Response } from "express";

import { type AuthRequest } from "../types/types.js";
import roomService from "../services/room.service.js";

class RoomController {
    async getAllRooms(req: AuthRequest, res: Response) {
        const userId = req.userId;

        const rooms = await roomService.getAllRooms(userId!);

        res.status(200).json({ success: true, data: rooms });
    }
}

export default new RoomController();