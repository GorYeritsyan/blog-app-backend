import { Response } from "express";
import productService from "../services/product.service.js";

import { type AuthRequest, type Pagination } from "../types/types.js";
import { BadRequestError } from "../errors/index.js";
import { productSchema } from "../validations/index.js";
import {ValidationError} from "../errors/validation.error.js";

class ProductController {
    async getAllProducts(req: AuthRequest<{}, {}, {}, { query: string; page: string; limit: string; orderBy: string; order: "asc" | "desc" }>, res: Response) {
        const { query = "", page = "1", limit = "10", orderBy = "createdAt", order = "desc" } = req.query;
        const currentUserId = req.userId;

        const { products, totalPages } = await productService.getAllProducts({ query, page, limit, orderBy, order, currentUserId: currentUserId! });

        // Pagination
        const pagination: Pagination = { currentPage: +page, totalPages, hasNext: +page < totalPages, hasPrev: +page > 1 };

        res.json({ success: true, data: { items: products, pagination } });
    }

    async getMyProducts(req: AuthRequest<{}, {}, {}, { query: string; page: string; limit: string; orderBy: string; order: "asc" | "desc" }>, res: Response) {
        const { query = "", page = "1", limit = "10", orderBy = "createdAt", order = "desc" } = req.query;
        const currentUserId = req.userId;

        const { products, totalPages } = await productService.getMyProducts({ query, page, limit, orderBy, order, currentUserId: currentUserId! });

        // Pagination
        const pagination: Pagination = { currentPage: +page, totalPages, hasNext: +page < totalPages, hasPrev: +page > 1 };

        res.json({ success: true, data: { items: products, pagination } });
    }

    async getProductById(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;
        const product = await productService.getProductById(+id);

        res.status(200).json({ success: true, data: product });
    }

    async createProduct(req: AuthRequest, res: Response) {
        const currentUserId = req.userId;

        const { error, value } = productSchema.validate(req.body);
        // if (error) throw new BadRequestError(error.message);
        if (error) throw new ValidationError({
            message: error.message,
            key: error.details[0].path[0] as string,
        });

        const { title, price } = value;

        const createdProduct = await productService.createProduct({ title, price: Number(price), image: req.file?.filename, sellerId: currentUserId! });

        res.status(201).json({ success: true, data: createdProduct });
    }

    async updateProduct(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;

        const { error, value } = productSchema.validate(req.body);
        // if (error) throw new BadRequestError(error.message);
        if (error) throw new ValidationError({
            message: error.message,
            key: error.details[0].path[0] as string,
        });

        const { title, price } = value;

        const updatedProduct = await productService.updateProduct({ title, price: Number(price), image: req.file?.filename, productId: +id, currentUserId: req.userId! });

        res.status(200).json({ success: true, data: updatedProduct });
    }

    async deleteProduct(req: AuthRequest<{ id: string }>, res: Response) {
        const { id } = req.params;

        const deletedProduct = await productService.deleteProduct({ productId: +id, currentUserId: req.userId! });

        res.status(200).json({ success: true, data: deletedProduct });
    }
}

export default new ProductController();