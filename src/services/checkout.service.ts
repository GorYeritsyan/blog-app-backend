import { stripe } from "../lib/stripe.js";
import { CartItem } from "../types/types.js";
import {Plan} from "../generated/prisma/client.js";

class CheckoutService {
    async createCheckoutSession({ items, userId, customerId }: { items: CartItem[]; userId: number; customerId: string }) {
        return await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "payment",
            payment_method_types: ["card"],
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
        return stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: plan.name,
                    },
                    unit_amount: plan.price * 100,

                    recurring: {
                        interval: "month"
                    }
                },
                quantity: 1,
            }],
            metadata: { userId },
        });
    }

    async getCheckoutSession(sessionId: string) {
       return await stripe.checkout.sessions.retrieve(sessionId);
    }
}

export default new CheckoutService();