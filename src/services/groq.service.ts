import {Groq} from "groq-sdk";
import {ChatCompletionMessageParam, ChatCompletionTool} from "groq-sdk/resources/chat/completions";
import {GROQ_API_KEY} from "../config/env.js";
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

class GroqService {
    // Helper method to create chat completion
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

    // Groq AI API call, generate reply using tools
    async getGroqChatCompletion(messages: ChatCompletionMessageParam[], currentUserId: number) {
        let completion = await this.createCompletion(messages, true);
        let responseMessage = completion.choices[0].message;

        const toolCalls = responseMessage.tool_calls;

        if (toolCalls) {
            messages.push(responseMessage);

            for (const call of toolCalls) {
                const args = JSON.parse(call.function.arguments);
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

        return responseMessage;
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
}

export default new GroqService();