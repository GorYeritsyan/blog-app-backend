import { prisma } from "../src/lib/prisma";
import {seedSubscriptionPlans} from "./seed-subscription-plans";
import {seedUsers} from "./users.seed";

async function seed() {
    await seedSubscriptionPlans();
    await seedUsers();
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());