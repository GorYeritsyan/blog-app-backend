import { prisma } from "../src/lib/prisma";
import { stripe } from "../src/lib/stripe";

const subscriptionPlans = [
    {
        name: "Basic Plan",
        description: "Access to premium features.",
        slug: "basic",
        price: 10,
        interval: "month" as const,
    },
    {
        name: "Pro Plan",
        description: "Access to premium features.",
        slug: "pro",
        price: 30,
        interval: "month" as const
    }
];

async function upsertStripePriceForPlan(plan: typeof subscriptionPlans[number]) {
    // Try to find an existing product by metadata slug to avoid duplicates on re-run
    const existing = await prisma.plan.findUnique({ where: { slug: plan.slug } });

    if (existing?.stripeProductId && existing?.stripePriceId) {
        return {
            productId: existing.stripeProductId,
            priceId: existing.stripePriceId,
        };
    }

    const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { slug: plan.slug },
    });

    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price * 100,
        currency: "usd",
        recurring: { interval: plan.interval },
    });

    return { productId: product.id, priceId: price.id };
}

export async function seedSubscriptionPlans() {
    for (const plan of subscriptionPlans) {
        const { productId, priceId } = await upsertStripePriceForPlan(plan);

        await prisma.plan.upsert({
            where: { slug: plan.slug },
            update: {
                name: plan.name,
                description: plan.description,
                price: plan.price,
                interval: plan.interval,
                stripeProductId: productId,
                stripePriceId: priceId,
            },
            create: {
                name: plan.name,
                slug: plan.slug,
                description: plan.description,
                price: plan.price,
                interval: plan.interval,
                stripeProductId: productId,
                stripePriceId: priceId,
            }
        });
    }

    console.log("Plans seeded successfully.");
}