import { Groq } from "groq-sdk";

import {prisma} from "../lib/prisma.js";
import {NotFoundError} from "../errors/index.js";
import {AiMessageRole, AiMessageStatus} from "../generated/prisma/enums.js";
import {GROQ_API_KEY} from "../config/env.js";
import {ChatCompletionMessageParam, ChatCompletionTool} from "groq-sdk/resources/chat/completions";
import productService from "./product.service.js";

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
                    query: {
                        type: "string",
                        description: "Keyword to search in product title, e.g. 'running shoes'. Leave empty to browse without a keyword filter.",
                    },
                    minPrice: {
                        type: "number",
                        description: "Minimum price in USD, only if user mentions a lower bound, e.g. 'above $50'",
                    },
                    maxPrice: {
                        type: "number",
                        description: "Maximum price in USD, only if user mentions an upper bound, e.g. 'under $100' or 'between $50 and $100'",
                    },
                    orderBy: {
                        type: "string",
                        enum: ["createdAt", "price"],
                        description: "Field to sort by. Use 'createdAt' for newest/latest products, 'price' for price-based sorting.",
                    },
                    order: {
                        type: "string",
                        enum: ["asc", "desc"],
                        description: "Sort direction. 'desc' for newest-first or highest-price-first, 'asc' for oldest-first or lowest-price-first.",
                    },
                    limit: {
                        type: "number",
                        description: "Number of results to return, default 5, max 10",
                    },
                },
                required: [],
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
    async getGroqChatCompletion(messages: ChatCompletionMessageParam[], currentUserId: number) {
        let completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            tools,
            tool_choice: "auto"
        });
        console.log("completion", completion);
        let responseMessage = completion.choices[0].message;
        const toolCalls = responseMessage.tool_calls;

        if (toolCalls) {
            messages.push(responseMessage);

            for (const call of toolCalls) {
                const args = JSON.parse(call.function.arguments);
                console.log("Arguments", args);

                const results = await productService.searchProductsForAI(args, currentUserId);

                messages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: JSON.stringify(results),
                });
            }

            completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages,
            });

            responseMessage = completion.choices[0].message;
        }

        console.log("tool calls", toolCalls);

        return responseMessage;
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

    async generateReply(conversationId: number, currentUserId: number) {
        const history = await this.getChatHistory(conversationId);
        const systemMessage: ChatCompletionMessageParam = {
            role: "system",
            content: "You are a shop assistant. Use search_products to find real products before recommending anything — never invent prices or stock. Keep answers short and friendly.",
        };

        // const messages = [{ role: "SYSTEM", content: "" }, ...history];
        const messages = [systemMessage, ...history];

        return await this.getGroqChatCompletion(messages as ChatCompletionMessageParam[], currentUserId);
    }
}

export default new AiChatService();