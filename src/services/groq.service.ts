import {Groq} from "groq-sdk";
import {
    ChatCompletionMessage,
    ChatCompletionMessageParam,
    ChatCompletionTool
} from "groq-sdk/resources/chat/completions";
import {GROQ_API_KEY} from "../config/env.js";
import {BadRequestError} from "../errors/index.js";
import cartService from "./cart.service.js";
import checkoutService from "./checkout.service.js";
import customerService from "./customer.service.js";

const groq = new Groq({ apiKey: GROQ_API_KEY });

const tools: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "add_to_cart",
            description: "Add a specific product to the user's cart",
            parameters: {
                type: "object",
                properties: {
                    productId: {
                        type: "number",
                        description: "The id of the product to add to cart"
                    },
                    quantity: {
                        type: "number",
                        description: "How many units to add, default 1",
                    }
                },
                required: ["productId"],
            }
        }
    },

    // Remove specific cart item
    {
        type: "function",
        function: {
            name: "remove_cart_item",
            description: "Remove a specific product from the user's cart",
            parameters: {
                type: "object",
                properties: {
                    productId: {
                        type: "number",
                        description: "The id of the product to remove from the cart"
                    }
                },
                required: ["productId"],
                additionalProperties: false
            }
        }
    },

    // Remove all cart items
    {
        type: "function",
        function: {
            name: "clear_cart_items",
            description: "Remove all items from the user's cart, emptying it completely",
            parameters: {
                type: "object",
                properties: {},
                required: [],
                additionalProperties: false
            }
        }
    },

    // create checkout session
    {
        type: "function",
        function: {
            name: "create_checkout_session",
            description: "Create a Stripe checkout session for all items currently in the user's cart, and return the checkout URL",
            parameters: {
                type: "object",
                properties: {},
                additionalProperties: false
            }
        }
    }
];

class GroqService {
    // Helper method to create chat completion
    private async createCompletion(messages: ChatCompletionMessageParam[], withTools: boolean, temperature?: number) {
        try {
            return await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                // model: "llama-3.1-8b-instant",
                messages,
                temperature: temperature ?? 0.2,
                ...(withTools ? { tools, tool_choice: "auto" } : {}),
            });
        } catch (error: any) {
            const code = error?.error?.error?.code;

            if (code === "rate_limit_exceeded") {
                console.error("Rate limit:", error?.error?.error);
                throw new BadRequestError("Rate limit exceeded.");
            }

            if (code === "tool_use_failed") {
                console.error("Tool use failed, retrying with tools at lower temperature:", error?.error?.error);
                try {
                    return await groq.chat.completions.create({
                        model: "llama-3.3-70b-versatile",
                        messages,
                        temperature: 0,
                        ...(withTools ? { tools, tool_choice: "auto" } : {}),
                    });
                } catch (retryError: any) {
                    console.error("Retry with tools also failed, falling back to no tools:", retryError);
                    return groq.chat.completions.create({
                        model: "llama-3.3-70b-versatile",
                        messages,
                        temperature: 0.2,
                    });
                }
            }

            throw error;
        }
    }

    private hasRawFunctionSyntax(message: ChatCompletionMessage) {
        const rawFunctionCallPattern = /<function=.*?>.*?<\/function>/s;
        return !!(message.content && rawFunctionCallPattern.test(message.content));
    }

    // Groq AI API call, generate reply using tools
    async getGroqChatCompletion(messages: ChatCompletionMessageParam[], currentUserId: number) {
        let completion = await this.createCompletion(messages, true);
        let responseMessage = completion.choices[0].message;

        // retry once if the model leaked raw function syntax instead of a real tool_call
        if (this.hasRawFunctionSyntax(responseMessage)) {
            console.error("Model leaked raw function-call syntax, retrying:", responseMessage.content);
            completion = await this.createCompletion(messages, true, 0);
            responseMessage = completion.choices[0].message;

            if (this.hasRawFunctionSyntax(responseMessage)) {
                throw new BadRequestError("malformed_tool_call");
            }
        }

        // retry once if the model returned nothing usable at all
        if (!responseMessage.tool_calls && !responseMessage.content?.trim()) {
            console.error("Empty response with no tool calls, retrying");
            completion = await this.createCompletion(messages, true, 0);
            responseMessage = completion.choices[0].message;
        }

        const toolCalls = responseMessage.tool_calls;
        let checkoutUrl;

        if (toolCalls) {
            messages.push(responseMessage);

            for (const call of toolCalls) {
                try {
                    const args = JSON.parse(call.function.arguments);

                    if (call.function.name === "add_to_cart") {
                        await cartService.addToCart({
                            productId: args.productId,
                            quantity: args.quantity ?? 1,
                            currentUserId,
                        });
                    } else if (call.function.name === "remove_cart_item") {
                        await cartService.removeCartItem({
                            currentUserId,
                            productId: args.productId,
                        });
                    } else if (call.function.name === "clear_cart_items") {
                        await cartService.clearCartItems(currentUserId);
                    } else if (call.function.name === "create_checkout_session") {
                        try {
                            const cartItems = await cartService.getCartItems(currentUserId);

                            if (cartItems.length === 0) {
                                messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify({ error: "Cart is empty, nothing to checkout" }) });
                                continue;
                            }

                            const missingPrice = cartItems.find(item => !item.product.stripePriceId);
                            if (missingPrice) {
                                messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify({ error: `"${missingPrice.product.title}" isn't available for checkout right now` }) });
                                continue;
                            }

                            const customerId = await customerService.upsertStripeCustomer(currentUserId);
                            const session = await checkoutService.createCheckoutSession({ items: cartItems as any, userId: currentUserId, customerId });

                            messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify({ checkoutUrl: session.url }) });
                            checkoutUrl = session.url;
                            continue;
                        } catch (err) {
                            messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify({ error: "Failed to create checkout session", reason: (err as Error).message }) });
                            continue;
                        }
                    }
                } catch (err) {
                    messages.push({
                        role: "tool",
                        tool_call_id: call.id,
                        content: JSON.stringify({ error: "Cart operation failed", reason: (err as Error).message }),
                    });
                    continue;
                }

                const results = await cartService.getCartItems(currentUserId);

                messages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: JSON.stringify(results),
                });
            }

            completion = await this.createCompletion(messages, false);
            responseMessage = completion.choices[0].message;

            if (!responseMessage.content?.trim()) {
                console.error("Empty final response, retrying");
                completion = await this.createCompletion(messages, false, 0);
                responseMessage = completion.choices[0].message;
            }
        }

        console.log("AI response", responseMessage);
        return { message: responseMessage, checkoutUrl };
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