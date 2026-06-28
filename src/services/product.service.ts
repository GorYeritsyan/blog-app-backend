import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../errors/index.js";
import {Prisma} from "../generated/prisma/client.js";

class ProductService {
    async getAllProducts({ query, page, limit, orderBy, order }: { query: string; page: string; limit: string; orderBy: string; order: "asc" | "desc" }) {
        const skip = (+page - 1) * +limit;

        const whereClause: Prisma.ProductWhereInput = {
            ...(query && { title: { contains: query, mode: "insensitive" } }),
        }

        const products = await prisma.product.findMany({
            where: whereClause,

            // Sort logic - { title: "asc" } || { content: "desc" } || etc...
            // Default - { createdAt: "desc" }
            orderBy: {
                [orderBy]: order
            },

            // Pagination
            take: +limit,
            skip,

            // Include author details
            include: {
                seller: true
            }
        });

        const totalProductsCount = await prisma.product.count({
            where: whereClause
        });
        const totalPages = totalProductsCount > 0 ? Math.ceil(totalProductsCount / +limit) : 1;

        return { products, totalPages };
    }

    async getProductById(productId: number) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) throw new NotFoundError(`Product with id ${productId} not found`);

        return product;
    }

    // Create product service
    async createProduct({ title, price, sellerId }: { title: string; price: number; sellerId: number }) {
        const user = await prisma.user.findUnique({
            where: {
                id: sellerId
            }
        });

        if (!user) throw new NotFoundError(`User with id ${sellerId} not found`);

       return prisma.product.create({
            data: {
                title,
                price,
                sellerId
            },
           include: {
                seller: true,
           }
        });
    }

    // Update product service
    async updateProduct({ title, price, productId }: { title: string; price: number; productId: number }) {
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            }
        });

        if (!product) throw new NotFoundError(`Product with id ${productId} not found`);

        return prisma.product.update({
            where: {
                id: productId
            },
            data: {
                title,
                price,
            }
        });
    }

    async deleteProduct(productId: number) {
        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        if (!product) throw new NotFoundError(`Product with id ${productId} not found`);

        return prisma.product.delete({
            where: {
                id: productId
            }
        });
    }
}

export default new ProductService();