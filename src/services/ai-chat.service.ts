import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../errors/index.js";
import { AiMessageRole, AiMessageStatus } from "../generated/prisma/enums.js";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import groqService from "./groq.service.js";

const SYSTEM_MESSAGE = `You are a shop assistant for this online store. You help users with questions 
about this shop's products.

SCOPE — figure out what the user is really asking:

1. Identify shop-specific questions that require searching the catalog, such as questions about prices, availability, or product details.
2. Use the "search_products" function to search the shop's catalog and provide accurate information.
3. Avoid relying on general knowledge or making guesses when a shop-specific question is asked.

1. If the question involves this shop's price, stock, availability, whether you 
   carry an item, or listing details ("do you have...", "how much is...", 
   "when was it added...") — this is ALWAYS a shop question, even for a famous, 
   well-known product. Call search_products. Never answer these fields from your 
   own knowledge, and never guess or estimate them.

2. If the question is general knowledge with no shop-specific field involved 
   (how something works, when it was invented, brand history, technical specs 
   in general) AND there's no reasonable reading of it as being about this shop's 
   listing — answer from your own knowledge, and you may note that you're 
   speaking generally, not about this shop's stock.

3. If you're unsure which case applies, call search_products first. A match 
   means treat it as a shop question. No match doesn't necessarily mean you 
   can fall back to general knowledge — only do that if the question truly 
   has no shop-specific field (case 2). If the question includes a shop-specific 
   field (price, stock, etc.) and search finds nothing, tell the user this shop 
   doesn't carry it. Do not then answer that field from general knowledge.

TOOL USE:
Call search_products as many times as the task needs — once per distinct 
product the user asks about, or again with a different query if your first 
search returns no results or a poor match. Don't repeat a search once you 
already have a good match. Once you have what you need, answer directly 
without narrating that you searched.

EXAMPLES:
- "When did the iPhone first come out?" → general knowledge, answer directly.
- "Do you have the iPhone 15 in stock?" → shop question, search_products.
- "How much is a MacBook?" → shop question, search_products. If no match: 
  "We don't carry MacBooks" — never quote Apple's price as a substitute.
- "How does a MacBook's Touch ID work?" → general knowledge, answer directly.`;

class AiChatService {
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

        const systemMessage: ChatCompletionMessageParam = {
            role: "system",
            content: SYSTEM_MESSAGE,
        };

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