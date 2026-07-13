import {stripe} from "../lib/stripe.js";
import {prisma} from "../lib/prisma.js";
import {NotFoundError} from "../errors/index.js";

class CustomerService {
    async upsertStripeCustomer(userId: number) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        });

        if (!user) throw new NotFoundError(`User with ID ${userId} not found.`);

        if (user.stripeCustomerId) {
            const isValid = await this.isValidStripeCustomer(user.stripeCustomerId);
            if (isValid) return user.stripeCustomerId;
        }

        const customer = await stripe.customers.create({
            name: user.name,
            email: user.email,
            metadata: {
                userId
            }
        });

        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                stripeCustomerId: customer.id
            }
        });

        return customer.id;
    }

    async isValidStripeCustomer(customerId: string) {
        const customer = await stripe.customers.retrieve(customerId);

        console.log("stripe customer", customer);
        return !customer.deleted;
    }
}

export default new CustomerService();