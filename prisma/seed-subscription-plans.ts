import { prisma } from "../src/lib/prisma";
import { stripe } from "../src/lib/stripe";

const subscriptionPlans = [
    {
        name: "Pro Plan",
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

async function seedSubscriptionPlans() {
    for (const plan of subscriptionPlans) {
        const { productId, priceId } = await upsertStripePriceForPlan(plan);

        await prisma.plan.upsert({
            where: { slug: plan.slug },
            update: {
                name: plan.name,
                price: plan.price,
                interval: plan.interval,
                stripeProductId: productId,
                stripePriceId: priceId,
            },
            create: {
                name: plan.name,
                slug: plan.slug,
                price: plan.price,
                interval: plan.interval,
                stripeProductId: productId,
                stripePriceId: priceId,
            }
        });
    }

    console.log("Plans seeded successfully.");
}

seedSubscriptionPlans().catch(console.error).finally(() => prisma.$disconnect());