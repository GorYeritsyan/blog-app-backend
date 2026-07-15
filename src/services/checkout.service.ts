import { stripe } from "../lib/stripe.js";
import { CartItem } from "../types/types.js";
import {Plan} from "../generated/prisma/client.js";
import {prisma} from "../lib/prisma.js";
import {BadRequestError} from "../errors/index.js";
import {ConflictError} from "../errors/http.error.js";

class CheckoutService {
    async createCheckoutSession({ items, userId, customerId }: { items: CartItem[]; userId: number; customerId: string }) {
        return await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "payment",
            payment_method_types: ["card"],
            saved_payment_method_options: {
                payment_method_save: "enabled"
            },
            line_items: items.map(item => ({
                // price_data: {
                //     currency: "usd",
                //     product_data: {
                //         name: item.product.title,
                //     },
                //     unit_amount: item.product.price * 100
                // },
                price: item.product.stripePriceId,
                quantity: item.quantity,
            })),

            success_url: `http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/checkout/cancel`,

            // Additional metadata to get from session when retrieving data
            metadata: { userId },
        });
    }

    async createSubscriptionCheckoutSession({ plan, userId, customerId }: { plan: Plan, userId: number; customerId: string }) {
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: { in: ["active", "trialing", "past_due"] }
            }
        });

        if (!existingSubscription) {
            return stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ["card"],
                mode: "subscription",
                saved_payment_method_options: {
                    payment_method_save: "enabled"
                },
                line_items: [{
                    // price_data: {
                    //     currency: "usd",
                    //     product_data: {
                    //         name: plan.name,
                    //     },
                    //     unit_amount: plan.price * 100,
                    //
                    //     recurring: {
                    //         interval: "month"
                    //     }
                    // },
                    price: plan.stripePriceId,
                    quantity: 1,
                }],
                success_url: `http://localhost:3000/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `http://localhost:3000/pricing/cancel`,

                // metadata: { planId: String(plan.id), userId: String(userId) },\
                subscription_data: {
                    metadata: { planId: String(plan.id), userId: String(userId) },
                }
            });
        }

        if (existingSubscription?.planId === plan.id) throw new ConflictError("Already subscribed to this plan");

        return stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: "http://localhost:3000/pricing",
        });
    }

    async getCheckoutSession(sessionId: string) {
       return await stripe.checkout.sessions.retrieve(sessionId);
    }
}

export default new CheckoutService();