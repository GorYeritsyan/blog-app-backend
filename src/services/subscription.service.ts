import Stripe from "stripe";
import {prisma} from "../lib/prisma.js";
import {NotFoundError} from "../errors/index.js";
import {stripe} from "../lib/stripe.js";

class SubscriptionService {
    async getUserSubscription(userId: number) {
        return prisma.subscription.findFirst({
            where: {
                userId,
                status: { in: ["active", "trialing", "past_due"] }
            },
            include: {
                plan: true
            }
        });
    }

    async syncSubscription(subscription: Stripe.Subscription) {
        const stripePriceId = subscription.items.data[0].price.id;

        const plan = await prisma.plan.findUnique({
            where: { stripePriceId },
        });
        if (!plan) throw new NotFoundError(`No local plan for price ${stripePriceId}`);

        const userId = Number(subscription.metadata?.userId);

        await prisma.subscription.upsert({
            where: { stripeSubscriptionId: subscription.id },
            update: {
                status: subscription.status,
                currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                planId: plan.id,
            },
            create: {
                stripeSubscriptionId: subscription.id,
                status: subscription.status,
                currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                userId,
                planId: plan.id,
            }
        })
    }

    async createBillingPortalSession(customerId: string) {
        return stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: "http://localhost:3000/pricing",
        });
    }
}

export default new SubscriptionService();