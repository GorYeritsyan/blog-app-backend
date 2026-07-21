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
            description: "Search this shop's own product catalog to answer shop-specific questions: price, stock, availability, or when a listing was added. Use this whenever the user is asking whether the shop sells something or wants shop details on a product — not for general knowledge questions unrelated to this store's listings.",
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
                        type: "integer",
                        minimum: 1,
                        maximum: 10,
                        description: "Number of results to return. Default 5 if omitted, max 10.",
                    },
                },
                required: [],
            },
        },
    },
];
const SYSTEM_MESSAGE = `You are a shop assistant for this online store.

You can answer general knowledge questions about products (how something works, when it was originally released, brand history, etc.) using your own knowledge, just like any helpful assistant.

But if the user is asking about THIS SHOP — price, stock/availability, whether you sell something, product listings, "do you have...", "how much is...", "when was it added" — you must call search_products and answer only from its results. Never guess or invent shop-specific details like price, stock, or listing date, even for a well-known product.

If you're unsure whether the user means the shop or general knowledge, prefer calling search_products first — if it finds a match, treat the question as being about that listing.

If search_products returns no results, say this shop doesn't carry it — don't fall back to general knowledge for those fields.

You only get one search per user message. After results come back, answer directly — don't narrate that you're searching.`;

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

    async generateChatTitle(message: string) {
        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: "Generate a short, concise title (max 6 words) summarizing the user's message. Respond with ONLY the title, no quotes, no trailing punctuation."
                    },
                    {
                        role: "user",
                        content: message,
                    }
                ],
                temperature: 0.3,
            });

            return completion.choices[0]?.message?.content?.trim() || "New Chat";
        } catch (error) {
            console.error("Title generation failed: ", error);
            return "New Chat";
        }
    }

    async saveMessage({ conversationId, role, content, status = "OK" }: { conversationId: number; role: AiMessageRole; content: string; status?: AiMessageStatus }) {
        const message = await prisma.aiMessage.create({
            data: {
                content,
                role,
                status,
                conversationId
            },
            include: {
                conversation: true
            }
        });

        if (!message.conversation.title) {
            const title = await this.generateChatTitle(content);
            await prisma.aiConversation.update({
                where: { id: conversationId },
                data: { title },
            });
        }

        return message;
    }

    // Groq AI API call
    async getGroqChatCompletion(messages: ChatCompletionMessageParam[], currentUserId: number) {
        let completion = await this.createCompletion(messages, true);
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

            completion = await this.createCompletion(messages, false);
            responseMessage = completion.choices[0].message;
        }

        console.log("tool calls", toolCalls);

        return responseMessage;
    }

    private async createCompletion(messages: ChatCompletionMessageParam[], withTools: boolean) {
        try {
            return await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages,
                ...(withTools ? { tools, tool_choice: "auto" } : {}),
            });
        } catch (error: any) {
            if (error?.error?.error?.code === "tool_use_failed") {
                return groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages,
                });
            }

            throw error;
        }
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
            content: SYSTEM_MESSAGE,
        };

        const messages = [systemMessage, ...history];

        return await this.getGroqChatCompletion(messages as ChatCompletionMessageParam[], currentUserId);
    }
}

export default new AiChatService();