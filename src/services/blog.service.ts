import db from "../db/index.js";
import type { TBlogPost, TBlogPostBody, TBlogPostQuery, TUpdateBlogPostProps } from "../types/types.js";
import {prisma} from "../lib/prisma.js";

class BlogService {
    private generateFilterQuery(query: string, values?: (string | number)[]) {
        const newValues = values ? [...values] : [];
        let filterQuery = "";

        if (query.trim()) {
            newValues.push(`%${query}%`);

            // Filter SQL query
            filterQuery = `WHERE title ILIKE $${newValues.length} OR content ILIKE $${newValues.length}`;
        }

        return { values: newValues, filterQuery };
    }

    // Get all blog posts service
    async getBlogPosts({ query, limit, page, orderBy, order, authorId }: Required<TBlogPostQuery> & { authorId: number }): Promise<{ data: TBlogPost[]; totalPages: number }> {
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
    async getBlogPostById(postId: number, authorId: number): Promise<TBlogPost> {
        return await prisma.post.findFirst({ where: { id: postId, authorId } });
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
    async updateBlogPost({ authorId, postId, data }: TUpdateBlogPostProps): Promise<TBlogPost> {
        return prisma.post.update({
            where: {
                authorId,
                id: postId
            },
            data
        });
    }

    // Delete blog post by ID service
    async deleteBlogPost(id: number): Promise<TBlogPost> {
        const { rows } = await db.query("DELETE FROM blog WHERE id = $1 RETURNING *", [id]);
        return rows[0];
    }
}

export default new BlogService();