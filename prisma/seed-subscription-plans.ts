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

async function createStripePriceForPlan(plan: typeof subscriptionPlans[number]) {
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
    await prisma.plan.deleteMany();

    for (const plan of subscriptionPlans) {
        const { productId, priceId } = await createStripePriceForPlan(plan);

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