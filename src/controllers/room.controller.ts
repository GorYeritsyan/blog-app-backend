import { type Response } from "express";

import { type AuthRequest } from "../types/types.js";
import roomService from "../services/room.service.js";
import {groupChatSchema} from "../validations/index.js";
import {BadRequestError} from "../errors/index.js";
import userService from "../services/user.service.js";
import friendService from "../services/friend.service.js";

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

        const friends = (await friendService.getFriends(currentUserId!)).map(friend => friend.id);
        const userIds = memberIds.filter(id => !friends.includes(id));

        if (userIds.length > 0) {
            throw new BadRequestError(`One or more selected members couldn't be added. Make sure everyone is in your friends list first.`)
        }

        const createdRoom = await roomService.createRoom({ currentUserId: currentUserId!, name, memberIds });

        res.status(201).json({ success: true, data: createdRoom });
    }

    async updateRoom(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;
        const currentUserId = req.userId;

        const { error, value } = groupChatSchema.validate(req.body);

        if (error) {
            throw new BadRequestError(error.message);
        }

        const { name, memberIds } = value;
        const updatedRoom = await roomService.updateRoom({ roomId: +id, currentUserId: currentUserId!, name, memberIds });

        res.status(200).json({ success: true, data: updatedRoom });
    }

    async leaveRoom(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;
        const currentUserId = req.userId;

        const leavedMember = await roomService.leaveRoom({ roomId: +id, userId: currentUserId! });
        res.status(200).json({ success: true, data: leavedMember });
    }
}

export default new RoomController();