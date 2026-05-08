import type { Request, Response } from "express";

import { createBlogPostSchema, updateBlogPostSchema } from "../validations/index.js";
import blogService from "../services/blog.service.js";
import type { ApiResponse, TBlogPost, TBlogPostBody, TBlogPostQuery, TPagination } from "../types/types.js";
import {prisma} from "../lib/prisma.js";


class BlogController {
    // Get all paginated blog posts controller
    async getBlogPosts(req: Request<{}, {}, {}, TBlogPostQuery>, res: Response<ApiResponse<TBlogPost[]>>) {

// Find all users with their posts
        const users = await prisma.user.findMany();

        console.log("users", users);
        // const { query = "", page = "1", limit = "10", orderBy = "created_at", order = "asc" } = req.query;
        //
        // const { data, totalPages } = await blogService.getBlogPosts({ query, limit, page, orderBy, order: order.toUpperCase() });
        //
        // // Pagination
        // const pagination: TPagination = { currentPage: +page, totalPages, hasNext: +page < totalPages, hasPrev: +page > 1 };
        //
        // res.json({ success: true, pagination, data });
        res.json({ success: true })
    }

    // Get blog post by id controller
    async getBlogPostById(req: Request<{ id: string }>, res: Response<ApiResponse<TBlogPost>>) {
        const { id } = req.params;

        const blogPost = await blogService.getBlogPostById(+id);

        if (!blogPost) {
            res.json({ success: false, message: `Blog Post by ID ${id} not found` })
            return;
        }

        res.json({ success: true, data: blogPost });
    }

    // Create new blog post controller
    async createBlogPost(req: Request<{}, {}, TBlogPostBody>, res: Response<ApiResponse<TBlogPost>>) {
        try {
            // Validate request body
            const validBody = await createBlogPostSchema.validateAsync(req.body);

            const newBlogPost = await blogService.createBlogPost(validBody);

            res.json({ success: true, data: newBlogPost });
        } catch (err: any) {
            res.json({ success: false, message: err.message });
        }
    }

    // Update blog post controller
    async updateBlogPost(req: Request<{ id: string }>, res: Response<ApiResponse<TBlogPost>>) {
        const { id } = req.params;

        // Create query strings from these arrays later on for update request
        const updateQueryArray: string[] = [];
        const updateQueryValues: string[] = [];

        try {
            // Validate request body
            const validBody = await updateBlogPostSchema.validateAsync(req.body);

            // Fill query arrays
            Object.entries(validBody).forEach(([key, value]) => {
                updateQueryValues.push(value);

                // title = $1, content = $2, etc...
                updateQueryArray.push(`${key} = $${updateQueryValues.length}`);
            });

            // Get blog post by ID
            const blogPost = await blogService.getBlogPostById(+id);

            // Handle Not found case
            if (!blogPost) {
                res.json({ success: false, message: `Blog Post by ID ${id} not found` });
                return;
            }

            // Update blog post by id
            try {
                const updatedBlogPost = await blogService.updateBlogPost({ id: +id, updateQueryString: updateQueryArray.join(", "), values: updateQueryValues });
                res.status(200).json({ success: true, data: updatedBlogPost });
            } catch (err) {
                res.status(500).json({ success: false, message: `Something went wrong when updating blog post by ID ${id}` });
            }
        } catch (err: any) {
            res.json({ success: false, message: err.message });
        }
    }

    // Delete blog post controller
    async deleteBlogPost(req: Request<{ id: string }>, res: Response<ApiResponse<TBlogPost>>) {
        const { id } = req.params;

        const deletedBlogPost = await blogService.deleteBlogPost(+id);

        res.json({ success: true, data: deletedBlogPost });
    }
}

export default new BlogController();