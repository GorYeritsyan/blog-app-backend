import { prisma } from "../lib/prisma.js";
import {FriendRequestStatus} from "../types/types.js";

class FriendService {
    async getAllFriendRequests() {
        return prisma.friendRequest.findMany();
    }

    // Get all incoming requests that need to be accepted or rejected
    async getIncomingRequests(receiverId: number) {
        return prisma.friendRequest.findMany({
            where: {
                receiverId,
                status: "PENDING"
            },
            include: {
                sender: true,
            }
        });
    }

    // Send friend request
    async sendFriendRequest({ senderId, receiverId }: { senderId: number; receiverId: number }) {
        return prisma.friendRequest.create({
            data: { senderId, receiverId }
        });
    }

    // Accept friend request
    async acceptFriendRequest({ requestId }: { requestId: number }) {
        return prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: "ACCEPTED" }
        });
    }

    // Reject friend request
    async rejectFriendRequest({ requestId }: { requestId: number }) {
        return prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: "REJECTED" }
        });
    }

    async removeFriend(requestId: number) {
        return prisma.friendRequest.delete({
            where: { id: requestId },
        });
    }
}

export default new FriendService();