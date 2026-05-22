import { prisma } from "../lib/prisma.js";
import {FriendRequestStatus} from "../types/types.js";

class FriendService {
    async getAllFriendRequests() {
        return prisma.friendRequest.findMany();
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

    // Receiver is current user
    async getAllReceivedRequests({ receiverId }: { receiverId: number }) {
        const allReceivedRequests = prisma.friendRequest.findMany({
            where: { receiverId, status: "PENDING" }
        });

        console.log(allReceivedRequests);
    }
}

export default new FriendService();