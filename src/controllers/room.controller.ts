import { type Response } from "express";

import { type AuthRequest } from "../types/types.js";
import roomService from "../services/room.service.js";
import {groupChatSchema} from "../validations/index.js";
import {BadRequestError} from "../errors/index.js";

class RoomController {
    async getAllRooms(req: AuthRequest, res: Response) {
        const userId = req.userId;

        const rooms = await roomService.getAllRooms(userId!);

        res.status(200).json({ success: true, data: rooms });
    }

    async createRoom(req: AuthRequest<{ id?: string }>, res: Response) {
        const currentUserId = req.userId;

        const { error, value } = groupChatSchema.validate(req.body);

        if (error) {
            throw new BadRequestError(error.message);
        }

        const { name, memberIds } = value;

        const createdRoom = await roomService.createRoom({ currentUserId: currentUserId!, name, memberIds });

        res.status(201).json({ success: true, data: createdRoom });
    }

    async updateRoom(req: AuthRequest<{ id?: string }>, res: Response) {
        const { id } = req.params;
        const currentUserId = req.userId;

        const { error, value } = groupChatSchema.validate(req.body);

        if (error) {
            throw new BadRequestError(error.message);
        }

        const { name, memberIds } = value;
        console.log("room id", +id)

        const updatedRoom = await roomService.updateRoom({ roomId: +id, currentUserId: currentUserId!, name, memberIds });

        res.status(200).json({ success: true, data: updatedRoom });
    }


}

export default new RoomController();