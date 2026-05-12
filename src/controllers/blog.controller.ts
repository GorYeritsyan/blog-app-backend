import type { Request, Response } from "express";

import { createBlogPostSchema, updateBlogPostSchema } from "../validations/index.js";
import blogService from "../services/blog.service.js";
import type { ApiResponse, AuthRequest, TBlogPost, TBlogPostBody, TBlogPostQuery, TPagination } from "../types/types.js";

class BlogController {
    // Get all paginated blog posts controller
    async getBlogPosts(req: AuthRequest<{}, {}, {}, TBlogPostQuery>, res: Response<ApiResponse<TBlogPost[]>>) {
        const { query = "", page = "1", limit = "10", orderBy = "createdAt", order = "asc" } = req.query;
        const authorId = req.userId;

        // Find all users with their posts
        const { data, totalPages } = await blogService.getBlogPosts({ query, limit, page, orderBy, order, authorId: authorId! });

        // Pagination
        const pagination: TPagination = { currentPage: +page, totalPages, hasNext: +page < totalPages, hasPrev: +page > 1 };

        res.json({ success: true, pagination, data });
    }

    // Get blog post by id controller
    async getBlogPostById(req: AuthRequest<{ id: string }>, res: Response<ApiResponse<TBlogPost>>) {
        const { id } = req.params;

        const blogPost = await blogService.getBlogPostById(+id);

        if (!blogPost) {
            res.json({ success: false, error: `Blog Post by ID ${id} not found` })
            return;
        }

        res.json({ success: true, data: blogPost });
    }

    // Create new blog post controller
    async createBlogPost(req: AuthRequest<{}, {}, TBlogPostBody>, res: Response<ApiResponse<TBlogPost>>) {
        try {
            // Validate request body
            const validBody = await createBlogPostSchema.validateAsync(req.body);
            const authorId = req.userId;

            const newBlogPost = await blogService.createBlogPost({ ...validBody, authorId: authorId! });

            res.json({ success: true, data: newBlogPost });
        } catch (err: any) {
            res.json({ success: false, error: err.message });
        }
    }

    // Update blog post controller
    async updateBlogPost(req: AuthRequest<{ id: string }>, res: Response<ApiResponse<TBlogPost>>) {
        const { id } = req.params;

        try {
            // Validate request body
            const validBody = await updateBlogPostSchema.validateAsync(req.body);

            // Get blog post by ID
            const blogPost = await blogService.getBlogPostById(+id);

            // Handle Not found case
            if (!blogPost) {
                res.json({ success: false, error: `Blog Post by ID ${id} not found` });
                return;
            }

            // Update blog post by id
            try {
                const updatedBlogPost = await blogService.updateBlogPost({ id: +id, data: validBody });
                res.status(200).json({ success: true, data: updatedBlogPost });
            } catch (err) {
                res.status(500).json({ success: false, error: `Something went wrong when updating blog post by ID ${id}` });
            }
        } catch (err: any) {
            res.json({ success: false, error: err.message });
        }
    }

    // Delete blog post controller
    async deleteBlogPost(req: AuthRequest<{ id: string }>, res: Response<ApiResponse<TBlogPost>>) {
        const { id } = req.params;

        const deletedBlogPost = await blogService.deleteBlogPost(+id);

        res.json({ success: true, message: `Blog post by ID ${id} successfully deleted`, data: deletedBlogPost });
    }
}

export default new BlogController();