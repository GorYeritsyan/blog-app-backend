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
    async getBlogPosts({ query, limit, page, orderBy, order }: Required<TBlogPostQuery>): Promise<{ data: TBlogPost[]; totalPages: number }> {
        const offset = (+page - 1) * +limit;
        const paginationValues = [limit, offset];

        // TODO: Check if there is any alternative way to implement sorting logic
        // Whitelist for orderBy and order list to prevent SQL Injection
        const allowedColumns = ["title", "content", "author", "created_at"];
        const allowedOrders = ["ASC", "DESC"];

        // Safe to use inside query, safe from SQL Injection
        const safeOrderBy = typeof orderBy !== "undefined" && allowedColumns.includes(orderBy) ? orderBy : "created_at";
        const safeOrder = typeof order !== "undefined" && allowedOrders.includes(order) ? order : "ASC";

        // Query values and queryString with or without filter logic
        const { values, filterQuery } = this.generateFilterQuery(query, paginationValues);
        const { values: countValues, filterQuery: countFilterQuery } = this.generateFilterQuery(query);

        // Get paginated data
        const { rows } = await db.query(`SELECT * FROM blog ${filterQuery} ORDER BY ${safeOrderBy} ${safeOrder} LIMIT $1 OFFSET $2`, values);

        // Get total results
        const { rows: total } = await db.query(`SELECT COUNT(*) FROM blog ${countFilterQuery}`, countValues);

        return { data: rows, totalPages: Math.ceil(total[0].count / +limit) };
    }

    // Get blog post by id service
    async getBlogPostById(id: number): Promise<TBlogPost> {
        // return await prisma.post.findUnique({ where: { id } });
        const { rows } = await db.query("SELECT * FROM blog WHERE id = $1", [id]);
        return rows[0];
    }

    // Create new blog post service
    async createBlogPost({ title, content, author }: TBlogPostBody): Promise<TBlogPost> {
        const { rows } = await db.query("INSERT INTO blog (title, content, author) VALUES ($1, $2, $3) RETURNING *", [title, content, author]);
        return rows[0];
    }

    // TODO: Check if this query safe from SQL Injection
    // Update blog post by ID service
    async updateBlogPost({ id, updateQueryString, values }: TUpdateBlogPostProps): Promise<TBlogPost> {
        const { rows } = await db.query(`UPDATE blog SET ${updateQueryString} WHERE id = ${id} RETURNING *`, values);
        return rows[0];
    }

    // Delete blog post by ID service
    async deleteBlogPost(id: number): Promise<TBlogPost> {
        const { rows } = await db.query("DELETE FROM blog WHERE id = $1 RETURNING *", [id]);
        return rows[0];
    }
}

export default new BlogService();