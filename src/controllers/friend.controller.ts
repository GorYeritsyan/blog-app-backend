import { Response } from "express";

import friendService from "../services/friend.service.js";
import {ApiResponse, AuthRequest} from "../types/types.js";

class FriendController {
    async getAllRequests(req: AuthRequest, res: Response) {
        const allFriendRequests = await friendService.getAllFriendRequests();
        res.json({ success: true, data: allFriendRequests });
    }

    // Send friend request to other user
    async sendFriendRequest(req: AuthRequest<{}, {}, { receiverId: number }>, res: Response) {
        const authorId = req.userId;
        const { receiverId } = req.body;

        const friendRequest = await friendService.sendFriendRequest({ senderId: authorId!, receiverId });

        res.json({ success: true, data: friendRequest });
    }
}

export default new FriendController();