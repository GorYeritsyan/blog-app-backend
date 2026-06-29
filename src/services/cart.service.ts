import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../errors/index.js";

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

        return cartItems?.items ?? [];
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

        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            }
        });

        if (!product) throw new NotFoundError(`Product with ID ${productId} not found`);

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

    async updateCartItemQuantity({ currentUserId, productId, type }: { currentUserId: number; productId: number; type: "increment" | "decrement" }) {
        const cart = await prisma.cart.findUnique({
            where: {
                userId: currentUserId,
            }
        });

        if (!cart) throw new NotFoundError(`Cart with userId ${currentUserId} not found`);

        const cartItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            }
        });

        if (!cartItem) throw new NotFoundError(`Cart item with productId ${productId} not found`);

        if (type === "decrement" && cartItem.quantity <= 1) {
            return prisma.cartItem.delete({
                where: { cartId_productId: { cartId: cart.id, productId } }
            });
        }

        return prisma.cartItem.update({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            },
            data: {
                quantity: { [type]: 1 }
            }
        });
    }

    async removeCartItem({ currentUserId, productId }: { currentUserId: number; productId: number }) {
        const cart = await prisma.cart.findUnique({
            where: {
                userId: currentUserId,
            }
        });

        if (!cart) throw new NotFoundError(`Cart item with userId ${currentUserId} not found`);

        return prisma.cartItem.delete({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            }
        });
    }

    async clearCartItems(userId: number) {
        const cart = await prisma.cart.findUnique({
            where: {
                userId
            }
        });

        if (!cart) throw new NotFoundError(`Cart items with userId ${userId} not found`);

        return prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id
            }
        });
    }
}

export default new CartService();