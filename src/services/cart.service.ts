import {prisma} from "../lib/prisma.js";
import {NotFoundError} from "../errors/index.js";

class CartService {
    async getCartItems(currentUserId: number) {
        const cartItems = await prisma.cart.findUnique({
            where: {
                userId: currentUserId
            },
            include: {
                items: true
            }
        });

        if (!cartItems) throw new NotFoundError(`Cart items with userId ${currentUserId} not found`);

        return cartItems;
    }

    async addToCart({ currentUserId, productId, quantity }: { currentUserId: number; productId: number; quantity: number }) {
        const cart = await prisma.cart.upsert({
            where: {
                userId: currentUserId,
            },
            create: {
                userId: currentUserId
            },
            update: {}
        });

        return prisma.cartItem.upsert({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            },
            create: {
                cartId: cart.id,
                productId,
                quantity
            },
            update: {
                quantity: { increment: quantity },
            }
        });
    }

    // async updateCartItem({ currentUserId, productId, quantity }: { currentUserId: number; productId: number; quantity: number }) {
    //
    // }

    async clearCartItems(userId: number) {
        const cartItems = await prisma.cart.findUnique({
            where: {
                userId
            }
        });

        if (!cartItems) throw new NotFoundError(`Cart items with userId ${userId} not found`);

        return prisma.cart.delete({
            where: {
                userId
            }
        });
    }
}

export default new CartService();