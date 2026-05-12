import type { BlogPost, BlogPostBody, BlogPostQuery, UpdateBlogPostProps } from "../types/types.js";
import { prisma } from "../lib/prisma.js";

class BlogService {
    // Get all blog posts service
    async getBlogPosts({ query, limit, page, orderBy, order, authorId }: Required<BlogPostQuery & { authorId: number }>): Promise<{ data: BlogPost[]; totalPages: number }> {
        const skip = (+page - 1) * +limit;

       const allBlogPosts = await prisma.post.findMany({
            where: {
                authorId,
                ...(query && {
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { content: { contains: query, mode: "insensitive" } },
                    ]
                }),
            },

            // Sort logic - { title: "asc" } || { content: "desc" } || etc...
            // Default - { createdAt: "asc" }
            orderBy: {
                [orderBy]: order
            },

            // Pagination
            take: +limit,
            skip,
        });

       // Total blog posts
       const totalBlogPosts = await prisma.post.count({
           where: {
               authorId,
               ...(query && {
                   OR: [
                       { title: { contains: query, mode: "insensitive" } },
                       { content: { contains: query, mode: "insensitive" } },
                   ]
               }),
           },
       });

       const totalPages = totalBlogPosts > 0 ? Math.ceil(totalBlogPosts / +limit) : 1;

       return { data: allBlogPosts, totalPages };
    }

    // Get blog post by id service
    async getBlogPostById(id: number): Promise<BlogPost | null> {
        return prisma.post.findUnique({ where: { id } });
    }

    // Create new blog post service
    async createBlogPost({ title, content, authorId }: BlogPostBody & { authorId: number }): Promise<BlogPost> {
        return prisma.post.create({
            data: {
                title,
                content,
                authorId,
            }
        });
    }

    // TODO: Check if this query safe from SQL Injection
    // Update blog post by ID service
    async updateBlogPost({ id, data }: UpdateBlogPostProps): Promise<BlogPost> {
        return prisma.post.update({
            where: {
                id
            },
            data
        });
    }

    // Delete blog post by ID service
    async deleteBlogPost(id: number): Promise<BlogPost> {
        return prisma.post.delete({
            where: { id }
        });
    }
}

export default new BlogService();