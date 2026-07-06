import { prisma } from "../lib/prisma.js";
import {BadRequestError} from "../errors/index.js";

class MessageService {
    // Get all messages, where I'm message sender or receiver from my friend
    async getMessages({ currentUserId, roomId, page, limit }: { currentUserId: number; roomId: number; page: string; limit: string }) {
        const skip = (+(page) - 1) * +limit;

        // All messages by roomId
        const messages = await prisma.message.findMany({
            where: {
                roomId
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

        // Total messages count
        const totalMessagesCount = await prisma.message.count({
            where: {
                roomId
            },
        });

        const totalPages = totalMessagesCount > 0 ? Math.ceil(totalMessagesCount / +limit) : 1;

        return { data: messages, totalPages };
    }

    // Send message service
    async sendMessage({ currentUserId, roomId, content }: { currentUserId: number; roomId: number; content: string }) {
        // check if user is member to that conversation
        const memberUser = await prisma.member.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId: currentUserId,
                }
            }
        });

        if (!memberUser) {
            throw new BadRequestError("You can't send messages in this conversation.");
        }

        const [sentMessage] = await prisma.$transaction([
            prisma.message.create({
                data: { senderId: currentUserId, roomId, content },
                include: {
                    sender: true,
                }
            }),

            prisma.room.update({
                where: {
                    id: roomId
                },
                data: { updatedAt: new Date() }
            })
        ]);

        return sentMessage;
    }
}

export default new MessageService();