import { prisma } from "../src/lib/prisma";

const subscriptionPlans = [
    {
        name: "Pro Plan",
        slug: "pro",
        price: 30
    }
];

async function seedSubscriptionPlans() {
    // Delete existing data
    await prisma.plan.deleteMany();

    await prisma.plan.createMany({
        data: subscriptionPlans.map(plan => ({ name: plan.name, slug: plan.slug, price: plan.price })),
    });
}

seedSubscriptionPlans().catch(console.error);