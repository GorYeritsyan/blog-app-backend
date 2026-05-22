import { prisma } from "../lib/prisma.js";

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

    async acceptFriendRequest({ requestId }: { requestId: number }) {
        const res = await prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: "ACCEPTED" }
        });

        console.log(res);
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