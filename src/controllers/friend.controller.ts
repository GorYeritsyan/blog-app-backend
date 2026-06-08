import { Response } from "express";

import friendService from "../services/friend.service.js";
import { AuthRequest } from "../types/types.js";

class FriendController {
    async getAllRequests(req: AuthRequest, res: Response) {
        const allFriendRequests = await friendService.getAllFriendRequests();
        res.status(200).json({ success: true, data: allFriendRequests });
    }

    async getFriends(req: AuthRequest, res: Response) {
        const userId = req.userId;

        const friends = await friendService.getFriends(userId!);
        res.status(200).json({ success: true, data: friends });
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

        const data = await friendService.acceptFriendRequest(+id);
        
        res.json({ success: true, data });
    }

    async rejectFriendRequest(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;

        const data = await friendService.rejectFriendRequest(+id);

        res.json({ success: true, data });
    }

    // Remove friend
    async removeFriend(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;
        const userId = req.userId;

        const data = await friendService.removeFriend({ userId: userId!, friendId: +id });

        res.json({ success: true, data });
    }
}

export default new FriendController();