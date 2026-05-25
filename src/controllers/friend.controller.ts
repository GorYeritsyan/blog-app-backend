import { Response } from "express";

import friendService from "../services/friend.service.js";
import {ApiResponse, AuthRequest, FriendRequestStatus} from "../types/types.js";
import {prisma} from "../lib/prisma.js";

class FriendController {
    async getAllRequests(req: AuthRequest, res: Response) {
        const allFriendRequests = await friendService.getAllFriendRequests();
        res.status(200).json({ success: true, data: allFriendRequests });
    }

    async getIncomingRequests(req: AuthRequest, res: Response) {
        const receiverId = req.userId;
        const incomingRequests = await friendService.getIncomingRequests(receiverId!);

        res.json({ success: true, data: incomingRequests });
    }

    // Send friend request to other user
    async sendFriendRequest(req: AuthRequest<{}, {}, { receiverId: number }>, res: Response) {
        const authorId = req.userId;
        const { receiverId } = req.body;

        const friendRequest = await friendService.sendFriendRequest({ senderId: authorId!, receiverId });

        res.json({ success: true, data: friendRequest });
    }

    async acceptFriendRequest(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;

        const data = await friendService.acceptFriendRequest({ requestId: +id });
        
        res.json({ success: true, data });
    }

    // TODO: For development
    async removeFriend(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;
        const data = await friendService.removeFriend(+id);

        res.json({ success: true, data });
    }
}

export default new FriendController();