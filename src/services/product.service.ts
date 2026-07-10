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

    async getProducts<T>({ query, page, limit, orderBy, order, currentUserId, where }: { query: string; page: string; limit: string; orderBy: string; order: "asc" | "desc", currentUserId: number; where: Prisma.ProductWhereInput }) {
        const skip = (+page - 1) * +limit;

        const products = await prisma.product.findMany({
            where,

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
            where
        });
        const totalPages = totalProductsCount > 0 ? Math.ceil(totalProductsCount / +limit) : 1;

        return { products, totalPages };
    }

    async getAllProducts({ query, page, limit, orderBy, order, currentUserId }: { query: string; page: string; limit: string; orderBy: string; order: "asc" | "desc", currentUserId: number }) {
        const whereClause: Prisma.ProductWhereInput = {
            ...(query && { title: { contains: query, mode: "insensitive" } }),
            sellerId: { not: currentUserId },
            isDeleted: false
        }

        const { products, totalPages } = await this.getProducts({ query, page, limit, orderBy, order, currentUserId, where: whereClause });

        return { products, totalPages };
    }

    async getMyProducts({ query, page, limit, orderBy, order, currentUserId }: { query: string; page: string; limit: string; orderBy: string; order: "asc" | "desc", currentUserId: number }) {
        const whereClause: Prisma.ProductWhereInput = {
            ...(query && { title: { contains: query, mode: "insensitive" } }),
            sellerId: currentUserId,
            isDeleted: false
        }

        const { products, totalPages } = await this.getProducts({ query, page, limit, orderBy, order, currentUserId, where: whereClause });

        return { products, totalPages };
    }

    async getProductById(productId: number) {
        const product = await prisma.product.findUnique({
            where: { id: productId, isDeleted: false },
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
                isDeleted: false
            }
        });

        if (!product) throw new NotFoundError(`Product with id ${productId} not found`);

        // Check if product seller is current user
        if (product.sellerId !== currentUserId) throw new ForbiddenError(`You don't have permission to update product with ID ${productId}`)

        if (image && product?.image) {
            await this.removeProductImage(product.image);
        }

        const productImagePath = image ? image : product.image;

        return prisma.product.update({
            where: {
                id: productId
            },
            data: {
                title,
                price,
                image: productImagePath,
            }
        });
    }

    async deleteProduct({ productId , currentUserId }: { productId: number, currentUserId: number }) {
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
                isDeleted: false
            }
        });

        // If product not found
        if (!product) throw new NotFoundError(`Product with id ${productId} not found`);

        // Check if product seller is current user
        if (product.sellerId !== currentUserId) throw new ForbiddenError(`You don't have permission to delete product with ID ${productId}`);

        return prisma.product.update({
            where: {
                id: productId
            },
            data: {
                isDeleted: true
            },
        });
    }
}

export default new ProductService();