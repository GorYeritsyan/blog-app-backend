import type { TBlogPost, TBlogPostBody, TBlogPostQuery, TUpdateBlogPostProps } from "../types/types.js";
import {prisma} from "../lib/prisma.js";

class BlogService {
    // Get all blog posts service
    async getBlogPosts({ query, limit, page, orderBy, order, authorId }: Required<TBlogPostQuery & { authorId: number }>): Promise<{ data: TBlogPost[]; totalPages: number }> {
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
    async getBlogPostById(id: number): Promise<TBlogPost> {
        return await prisma.post.findUnique({ where: { id } });
        // const { rows } = await db.query("SELECT * FROM blog WHERE id = $1", [id]);
        // return rows[0];
    }

    // Create new blog post service
    async createBlogPost({ title, content, authorId }: TBlogPostBody): Promise<TBlogPost> {
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
    async updateBlogPost({ id, data }: TUpdateBlogPostProps): Promise<TBlogPost> {
        return prisma.post.update({
            where: {
                id
            },
            data
        });
    }

    // Delete blog post by ID service
    async deleteBlogPost(id: number): Promise<TBlogPost> {
        return prisma.post.delete({
            where: { id }
        });
    }
}

export default new BlogService();