import { prisma } from "../lib/prisma.js";

class MessageService {
    // Get all messages, where I'm message sender or receiver from my friend
    async getMessages({ currentUserId, friendId }: { currentUserId: number; friendId: number }) {
       return prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: friendId },
                    { senderId: friendId, receiverId: currentUserId },
                ]
            },
           include: {
                sender: true,
           }
        })
    }

    // Send message service
    async sendMessage({ currentUserId, friendId, content }: { currentUserId: number; friendId: number; content: string }) {
        // prisma.friendRequest.findUnique({ where: {  } })
        // todo: check if receiver is current user friend
        return prisma.message.create({
            data: { senderId: currentUserId, receiverId: friendId, content },
        });
    }
}

export default new MessageService();