import {prisma} from "../lib/prisma.js";
import {NotFoundError} from "../errors/index.js";
import {AiMessageRole, AiMessageStatus} from "../generated/prisma/enums.js";

// todo: error handling
class AiChatService {
    async getAllConversations(userId: number) {
        return prisma.aiConversation.findMany({
            where: { userId },
        });
    }

    async getConversation({ conversationId, userId }: { conversationId: number; userId: number }) {
        const conversation = await prisma.aiConversation.findUnique({
            where: {
                id: conversationId,
                userId,
            },

            include: {
                messages: true
            }
        });

        if (!conversation) throw new NotFoundError(`Conversation by ID ${conversationId} not found`);
        return conversation;
    }

    async getOrCreateConversation({ userId, conversationId }: { userId: number; conversationId: number }) {
        if (conversationId) {
            const existing = await prisma.aiConversation.findFirst({
                where: { id: conversationId, userId },
            });
            if (existing) return existing;
        }

        return prisma.aiConversation.create({ data: { userId } });
    }

    // async getHistory({ conversationId, limit = 20 }: { conversationId: number }) {
    //     return prisma.aiMessage.findMany({
    //         where: { conversationId, status: "OK", role: { not: "SYSTEM" } },
    //         orderBy: { createdAt: "asc" },
    //         take: limit
    //     });
    // }

    async saveMessage({ conversationId, role, content, status = "OK",  }: { conversationId: number; role: AiMessageRole; content: string; status?: AiMessageStatus }) {
        return prisma.aiMessage.create({
            data: {
                content,
                role,
                status,
                conversationId
            },
        });
    }

    // async generateReply(conversationId: number) {
    //     const history = await this.getHistory({ conversationId });
    //     const messages = [{ role: "system", content: "" }, ...history];
    //
    //     // call groq API
    //
    //     // return { content: reply.content };
    // }
}

export default new AiChatService();