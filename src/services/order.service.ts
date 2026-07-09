import Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../errors/index.js";

class OrderService {
    // Get all orders service
    async getAllOrders(userId: number) {
        return prisma.order.findMany({
            where: {
                userId
            },

            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    // Get order by id service
    async getOrderById({ orderId, userId }: { orderId: number; userId: number }) {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
                userId
            },
            include: {
                items: {
                    include: {
                        product: true
                    },
                },
            },
        });

        if (!order) throw new NotFoundError(`Order by ID ${orderId} not found`);

        return order;
    }

    // Create order service
    async createOrder({ userId, session }: { userId: number; session: Stripe.Checkout.Session }) {
        const existingOrder = await prisma.order.findUnique({
            where: { stripeSessionId: session.id },
        });
        if (existingOrder) return;

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        if (!cart) throw new NotFoundError(`Cart items with userId ${userId} not found`);

        const cartItems = cart.items ?? [];

        const total = cartItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );

        await prisma.$transaction([
            prisma.order.create({
                data: {
                    userId,
                    total,
                    currency: session.currency!,
                    stripeSessionId: session.id,
                    items: {
                        create: cartItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                        })),
                    },
                },
            }),
            prisma.cartItem.deleteMany({ where: { cartId: cart?.id } }),
        ]);
    }
}

export default new OrderService();