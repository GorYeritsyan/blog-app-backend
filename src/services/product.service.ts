import fs from "fs/promises";
import path from "path";

import { prisma } from "../lib/prisma.js";
import {ForbiddenError, NotFoundError} from "../errors/index.js";
import {Prisma} from "../generated/prisma/client.js";
import {__dirname} from "../app.js";

class ProductService {
    private async removeProductImage(image: string) {
        const oldImagePath = path.join(__dirname, "..", `uploads/products/` + path.basename(image));
        await fs.unlink(oldImagePath);
    }

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
    async createProduct({ title, price, image, sellerId }: { title: string; price: number; image?: string; sellerId: number }) {
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
                image,
                sellerId
            },
           include: {
                seller: true,
           }
        });
    }

    // Update product service
    async updateProduct({ title, price, productId, image, currentUserId }: { title: string; price: number; image?: string; productId: number; currentUserId: number }) {
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            }
        });

        if (!product) throw new NotFoundError(`Product with id ${productId} not found`);

        // Check if product seller is current user
        if (product.sellerId !== currentUserId) throw new ForbiddenError(`You don't have permission to update product with ID ${productId}`)

        if (product?.image) {
            await this.removeProductImage(product.image);
        }

        return prisma.product.update({
            where: {
                id: productId
            },
            data: {
                title,
                price,
                image
            }
        });
    }

    async deleteProduct({ productId , currentUserId }: { productId: number, currentUserId: number }) {
        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        // If product not found
        if (!product) throw new NotFoundError(`Product with id ${productId} not found`);

        // Check if product seller is current user
        if (product.sellerId !== currentUserId) throw new ForbiddenError(`You don't have permission to delete product with ID ${productId}`)

        if (product?.image) {
            await this.removeProductImage(product.image);
        }

        return prisma.product.delete({
            where: {
                id: productId
            }
        });
    }
}

export default new ProductService();