import type { NextFunction, Response } from "express";

import { createBlogPostSchema, updateBlogPostSchema } from "../validations/index.js";
import blogService from "../services/blog.service.js";
import type { ApiResponse, AuthRequest, BlogPost, BlogPostBody, BlogPostQuery, Pagination } from "../types/types.js";
import {AppError, BadRequestError, ForbiddenError, NotFoundError} from "../errors/index.js";

class BlogController {
    // Get all paginated blog posts controller
    async getBlogPosts(req: AuthRequest<{}, {}, {}, BlogPostQuery>, res: Response<ApiResponse<BlogPost[]>>) {
        const { query = "", page = "1", limit = "10", orderBy = "createdAt", order = "desc" } = req.query;

        // Find all users with their posts
        const { data, totalPages } = await blogService.getBlogPosts({ query, limit, page, orderBy, order });

        // Pagination
        const pagination: Pagination = { currentPage: +page, totalPages, hasNext: +page < totalPages, hasPrev: +page > 1 };

        res.json({ success: true, pagination, data });
    }

    // Get blog post by id controller
    async getBlogPostById(req: AuthRequest<{ id: string }>, res: Response<ApiResponse<BlogPost>>, next: NextFunction) {
        const { id } = req.params;

        const blogPost = await blogService.getBlogPostById(+id);
        res.json({ success: true, data: blogPost });
    }

    // Create new blog post controller
    async createBlogPost(req: AuthRequest<{}, {}, BlogPostBody>, res: Response<ApiResponse<BlogPost>>) {
        // Validate request body
        const { error, value: validBody } = createBlogPostSchema.validate(req.body);
        if (error) throw new BadRequestError("Invalid request body");

        // const validBody = await createBlogPostSchema.validateAsync(req.body);

        const authorId = req.userId;

        const newBlogPost = await blogService.createBlogPost({ ...validBody, authorId: authorId! });
        if (!newBlogPost) throw new AppError(`Something went wrong when creating new blog post`, 500);

        res.status(201).json({ success: true, data: newBlogPost });
    }

    // Update blog post controller
    async updateBlogPost(req: AuthRequest<{ id: string }>, res: Response<ApiResponse<BlogPost>>) {
        const { id } = req.params;
        const authorId = req.userId;

        // Validate request body
        const { error, value: validBody } = updateBlogPostSchema.validate(req.body);
        if (error) throw new BadRequestError("Invalid request body");

        // Get blog post by ID
        const blogPost = await blogService.getBlogPostById(+id);

        // Handle Not found case
        if (!blogPost) throw new NotFoundError(`Blog Post by ID ${id} not found`);

        // Don't allow users edit other authors posts
        if (blogPost.authorId !== authorId) throw new ForbiddenError(`You can only edit your own posts`);

        // Update blog post by id
        const updatedBlogPost = await blogService.updateBlogPost({ id: +id, data: validBody, authorId: authorId! });
        // TODO: Check if this express catches this error properly
        if (!updatedBlogPost) throw new AppError(`Something went wrong when updating new blog post by ID ${id}`, 500);

        res.status(200).json({ success: true, data: updatedBlogPost });
    }

    // Delete blog post controller
    async deleteBlogPost(req: AuthRequest<{ id: string }>, res: Response<ApiResponse<BlogPost>>) {
        const { id } = req.params;
        const authorId = req.userId;

        // Get blog post by ID
        const blogPost = await blogService.getBlogPostById(+id);

        // Not found error
        if (!blogPost) throw new NotFoundError(`Blog Post by ID ${id} not found`);

        // Forbidden error to not allow users delete other authors posts
        if (blogPost.authorId !== authorId) throw new ForbiddenError("You can only delete your own posts");

        // Delete post
        const deletedBlogPost = await blogService.deleteBlogPost(+id);

        res.json({ success: true, message: `Blog post by ID ${id} successfully deleted`, data: deletedBlogPost });
    }
}

export default new BlogController();