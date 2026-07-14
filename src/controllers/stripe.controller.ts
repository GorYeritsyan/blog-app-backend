import { type Request, type Response } from "express";
import stripeService from "../services/stripe.service.js";
import orderService from "../services/order.service.js";
import subscriptionService from "../services/subscription.service.js";

class StripeController {
    async handleWebhookEvent(req: Request, res: Response) {
        let event;

        try {
            event = stripeService.verifyWebhookSignature(req.body, req.headers["stripe-signature"] as string);
        } catch (err: any) {
            console.log("Webhook signature verification failed: ", err.message);
            return res.sendStatus(400);
        }

        // Send to stripe
        res.status(200).send();

        // Handle event
        try {
            switch (event.type) {
                case "checkout.session.completed":
                    const session = event.data.object;

                    if (session.mode === "payment" && session.payment_status === "paid" && session.metadata) {
                        await orderService.createOrder({ userId: +session.metadata.userId, session });
                    }

                    break;

                case "customer.subscription.created":
                case "customer.subscription.updated":
                case "customer.subscription.deleted": {
                    const subscription = event.data.object;
                    await subscriptionService.syncSubscription(subscription);
                    break;
                }

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
        } catch (err) {
            console.error("Error processing webhook event:", err);
        }
    }
}

export default new StripeController();