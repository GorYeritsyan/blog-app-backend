import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../errors/index.js";
import { AiMessageRole, AiMessageStatus } from "../generated/prisma/enums.js";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import groqService from "./groq.service.js";
import productService from "./product.service.js";
import {CartItem, Product} from "../types/types.js";
import cartService from "./cart.service.js";

class AiChatService {
    private generateSystemMessage({ products, cartItems }: any): ChatCompletionMessageParam {
        const productsDto = products.map((p: Product) => ({
            id: p.id,
            title: p.title,
            createdAt: p.createdAt,
            price: p.price,
            updatedAt: p.updatedAt
        }));

        const cartItemsDto = cartItems.map((item: CartItem) => ({
            id: item.id,
            productId: item.productId,
            title: item.product.title,
            price: item.product.price,
            quantity: item.quantity
        }));

        return {
            role: "system",
            content: `You are a shopping assistant for an online shop.
            Products:
            ${JSON.stringify(productsDto, null, 2)}
            Cart:
            ${JSON.stringify(cartItemsDto, null, 2)}
                
            Answer questions about product titles and prices only. Say "not available" for anything else (materials, stock, shipping, etc). Always include currency with prices.
            
            You can add, remove, and clear items from the user's cart using tools. Rules:
            - Only say something was added/removed/cleared if the tool call actually succeeded — never assume.
            - If the user mentions multiple products, call the tool once per product.
            - If the user wants to check out or purchase their cart (e.g. "let's checkout", "buy this"), call create_checkout_session. Tell them you're taking them to checkout — do not describe a purchase as complete, since checkout happens on Stripe's page, not here.
            - Don't show Stripe session URL, just say that redirecting to checkout page
            
            After a cart action (add, remove, clear, checkout), only confirm what happened based on the exact result returned by the tool. If the tool result shows no change occurred, or shows a different quantity than expected, tell the customer honestly what the cart actually contains — never assume an action succeeded.
            
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
        const cartItems = await cartService.getCartItems(currentUserId);

        const systemMessage = this.generateSystemMessage({ products, cartItems });

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