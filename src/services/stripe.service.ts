import {stripe} from "../lib/stripe.js";
import {STRIPE_WEBHOOK_SECRET} from "../config/env.js";

class StripeService {
    verifyWebhookSignature(rawBody: Buffer, signature: string) {
        return stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET!);
    }
}

export default new StripeService();