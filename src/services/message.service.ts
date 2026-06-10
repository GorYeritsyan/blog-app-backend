import { prisma } from "../lib/prisma.js";

class MessageService {
    // Get all messages, where I'm message sender or receiver from my friend
    async getMessages({ currentUserId, friendId, page, limit }: { currentUserId: number; friendId: number; page: string; limit: string }) {
        const skip = (+(page) - 1) * +limit;

        // Total messages
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: friendId },
                    { senderId: friendId, receiverId: currentUserId },
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 10,
            skip,

            include: {
                sender: true,
            }
        });

        // Total count
        const totalMessagesCount = await prisma.message.count({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: friendId },
                    { senderId: friendId, receiverId: currentUserId },
                ]
            },
        });

        const totalPages = totalMessagesCount > 0 ? Math.ceil(totalMessagesCount / +limit) : 1;

        return { data: messages, totalPages };
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