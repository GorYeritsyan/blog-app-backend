import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../errors/index.js";

class FriendService {
    async getAllFriendRequests() {
        return prisma.friendRequest.findMany();
    }

    // Get current user all friends
    async getFriends(userId: number) {
        return prisma.friendRequest.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: "ACCEPTED"
            }
        });
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
        // If status rejected then send friend request again
        return prisma.friendRequest.upsert({
           where: {
               senderId_receiverId: {
                   senderId,
                   receiverId,
               },
               status: "REJECTED"
           },
           update: {
               status: "PENDING"
           },
           create: { senderId, receiverId }
       });
    }

    // Accept friend request
    async acceptFriendRequest(requestId: number) {
        return prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: "ACCEPTED" }
        });
    }

    // Reject friend request
    async rejectFriendRequest(requestId: number) {
        return prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: "REJECTED" }
        });
    }

    async removeFriend({ userId, friendId }: { userId: number; friendId: number }) {
         const friendRequest = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { senderId: userId, receiverId: friendId },
                    { senderId: friendId, receiverId: userId }
                ]
            }
        });

         if (!friendRequest) throw new NotFoundError(`Friend with ID ${friendId} not found`);

         return prisma.friendRequest.delete({
             where: { id: friendRequest.id }
         });
    }
}

export default new FriendService();