import {CartItem} from "../generated/prisma/client.js";
import {stripe} from "../lib/stripe.js";

class CheckoutService {
    async createCheckoutSession({ items, userId, customerId }: { items: CartItem[]; userId: number; customerId: string }) {
        return await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "payment",
            payment_method_types: ["card"],
            line_items: items.map(item => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.product.title,
                    },
                    unit_amount: item.product.price * 100
                },
                quantity: item.quantity,
            })),

            success_url: `http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/checkout/cancel`,

            // Additional metadata to get from session when retrieving data
            metadata: { userId },
        });
    }

    async getCheckoutSession(sessionId: string) {
       return await stripe.checkout.sessions.retrieve(sessionId);
    }
}

export default new CheckoutService();