import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../errors/index.js";
import { AiMessageRole, AiMessageStatus } from "../generated/prisma/enums.js";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import groqService from "./groq.service.js";
import productService from "./product.service.js";
import {Product} from "../types/types.js";

const SYSTEM_MESSAGE = `You are a helpful AI sales assistant for an online shop. Your role is strictly limited to assisting users with product inquiries by searching the store's inventory.

Guidelines:
- **Strict Domain Boundary:** You ONLY answer questions about this shop and its products. Politely decline any off-topic, general knowledge, or personal questions, explaining that you can only assist with this store's listings.
- **Mandatory Tool Usage:** Always call 'search_products' to check inventory before answering product queries. Never assume product details or fabricate items.
- **Product Information:** Store items only have titles and prices. If users ask for detailed specifications or extra information, inform them that only basic details (title and price) are available for these listings.
- **Tone & Pacing:** Be polite, concise, and direct. Keep responses brief and ask a maximum of one follow-up question at a time.`;

class AiChatService {
    private generateSystemMessage(products: unknown): ChatCompletionMessageParam {
        return {
            role: "system",
            content: `You are a shopping assistant for an online shop.
            Products:
            ${JSON.stringify(products, null, 2)}
                
            Answer questions about product titles and prices only. Say "not available" for anything else (materials, stock, shipping, etc). Always include currency with prices.
                
            You can add, remove, and clear items from the user's cart using tools. Rules:
            - Only say something was added/removed/cleared if the tool call actually succeeded — never assume.
            - If the user mentions multiple products, call the tool once per product.
            - Confirm with the user before clearing the whole cart.
            - If the user wants to check out or purchase their cart (e.g. "let's checkout", "buy this"), call create_checkout_session. Tell them you're taking them to checkout — do not describe a purchase as complete, since checkout happens on Stripe's page, not here.
            
            Keep replies short and friendly.`
        }
    }

    // Get All conversations
    async getAllConversations(userId: number) {
        return prisma.aiConversation.findMany({
            where: { userId },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    // Get conversation by ID
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

    // Get conversation by ID or create new one if not existing
    async getOrCreateConversation({ userId, conversationId }: { userId: number; conversationId: number }) {
        if (conversationId) {
            const existing = await prisma.aiConversation.findUnique({
                where: { id: conversationId, userId },
            });
            if (existing) return existing;
        }

        return prisma.aiConversation.create({ data: { userId } });
    }

    // Save user or assistant messages in the DB
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
            const title = await groqService.generateChatTitle(content);
            await prisma.aiConversation.update({
                where: { id: conversationId },
                data: { title },
            });
        }

        return message;
    }

    // Get previous chat all messages
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

    // Generate AI chat reply
    async generateReply(conversationId: number, currentUserId: number) {
        const history = await this.getChatHistory(conversationId);

        const { products } = await productService.getAllProducts({ query: "", currentUserId, orderBy: "createdAt", order: "desc", limit: "30", page: "1" });
        const systemMessage = this.generateSystemMessage(products);

        const messages = [systemMessage, ...history];

        return await groqService.getGroqChatCompletion(messages as ChatCompletionMessageParam[], currentUserId);
    }

    async removeConversation({ conversationId, userId }: { conversationId: number; userId: number }) {
        const existingConversation = await prisma.aiConversation.findUnique({
            where: {
                id: conversationId,
                userId,
            }
        });

        if (!existingConversation) throw new NotFoundError(`Conversation by ID ${conversationId} not found`);

        return prisma.aiConversation.delete({
            where: {
                id: conversationId,
                userId,
            }
        });
    }
}

export default new AiChatService();