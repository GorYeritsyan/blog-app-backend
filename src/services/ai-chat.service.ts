import { Groq } from "groq-sdk";

import {prisma} from "../lib/prisma.js";
import {NotFoundError} from "../errors/index.js";
import {AiMessageRole, AiMessageStatus} from "../generated/prisma/enums.js";
import {GROQ_API_KEY} from "../config/env.js";
import {ChatCompletionMessageParam, ChatCompletionTool} from "groq-sdk/resources/chat/completions";

const groq = new Groq({ apiKey: GROQ_API_KEY });

const tools: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "search_products",
            description: "Search the shop's product catalog by name, price or keyword",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Search term, e.g. 'running shoes'" },
                },
                required: ["query"],
            },
        },
    },
];

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
            const existing = await prisma.aiConversation.findUnique({
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

    async saveMessage({ conversationId, role, content, status = "OK" }: { conversationId: number; role: AiMessageRole; content: string; status?: AiMessageStatus }) {
        return prisma.aiMessage.create({
            data: {
                content,
                role,
                status,
                conversationId
            },
        });
    }

    // Groq AI API call
    async getGroqChatCompletion(messages: ChatCompletionMessageParam[] ) {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            // tools: [],
            // tool_choice: "auto"
        });
        console.log("completion", completion);

        return completion.choices[0].message;
    }

    async getChatHistory(conversationId: number, limit = 20) {
        const chatMessages = await prisma.aiMessage.findMany({
            where: {
                conversationId,
                status: "OK",
                role: { not: "SYSTEM" },
            },
            orderBy: {
                createdAt: "asc",
            },
            take: limit,
        });

        return chatMessages.map(message => ({ role: message.role.toLowerCase(), content: message.content }));
    }

    async generateReply(conversationId: number) {
        const history = await this.getChatHistory(conversationId);
        // const messages = [{ role: "SYSTEM", content: "" }, ...history];
        const messages = [...history];

        return await this.getGroqChatCompletion(messages as ChatCompletionMessageParam[]);
    }
}

export default new AiChatService();