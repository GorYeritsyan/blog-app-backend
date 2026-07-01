import {CartItem} from "../generated/prisma/client.js";
import {stripe} from "../lib/stripe.js";

class CheckoutService {
    async createCheckoutSession(items: CartItem[]) {
        return await stripe.checkout.sessions.create({
            mode: "payment",
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

            success_url: `http://localhost:3000/products?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/products?cancel=true`,
        });
    }

    async getCheckoutSession(sessionId: string) {
       return await stripe.checkout.sessions.retrieve(sessionId);
    }
}

export default new CheckoutService();