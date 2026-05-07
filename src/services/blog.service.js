import db from "../db/index.js";

class BlogService {
    // TODO: Change to private function after typescript setup
    #generateFilterQuery(query, values) {
        const newValues = values ? [...values] : [];
        let filterQuery = "";

        if (query) {
            newValues.push(`%${query}%`);
            filterQuery = `WHERE title ILIKE $${newValues.length} OR content ILIKE $${newValues.length}`;
        }

        return { values: newValues, filterQuery };
    }

    // TODO: Implement sort and pagination logic
    // Get all blog posts
    async getBlogPosts({ query, limit, page, orderBy, order }) {
        const offset = (+page - 1) * +limit;
        const paginationValues = [limit, offset];

        // TODO: Check if there is any alternative way to implement sorting logic
        // Whitelist for orderBy and order list to prevent SQL Injection
        const allowedColumns = ["id", "title", "content", "author", "created_at"];
        const allowedOrders = ["ASC", "DESC"];

        // Safe to use inside query, safe from SQL Injection
        const safeOrderBy = allowedColumns.includes(orderBy) ? orderBy : "created_at";
        const safeOrder = allowedOrders.includes(order) ? order : "ASC";

        // Query values and queryString with or without filter logic
        const { values, filterQuery } = this.#generateFilterQuery(query, paginationValues);
        const { values: countValues, filterQuery: countFilterQuery } = this.#generateFilterQuery(query);

        // Get paginated data
        const { rows } = await db.query(`SELECT * FROM blog ${filterQuery} ORDER BY ${safeOrderBy} ${safeOrder} LIMIT $1 OFFSET $2`, values);

        // Get total results
        const { rows: total } = await db.query(`SELECT COUNT(*) FROM blog ${countFilterQuery}`, countValues);

        return { data: rows, totalPages: Math.ceil(total[0].count / +limit) };
    }

    // Get blog post by id
    async getBlogPostById(id) {
        const { rows } = await db.query("SELECT * FROM blog WHERE id = $1", [id]);
        return rows[0];
    }

    // Create new blog post
    async createBlogPost({ title, content, author }) {
        const { rows } = await db.query("INSERT INTO blog (title, content, author) VALUES ($1, $2, $3) RETURNING *", [title, content, author]);
        return rows[0];
    }

    // TODO: Check if this query safe from SQL Injection
    // Update blog post by ID
    async updateBlogPost({ id, updateQueryString, values }) {
        const { rows } = await db.query(`UPDATE blog SET ${updateQueryString} WHERE id = ${id} RETURNING *`, values);
        return rows[0];
    }

    // Delete blog post by ID
    async deleteBlogPost(id) {
        const { rows } = await db.query("DELETE FROM blog WHERE id = $1 RETURNING *", [id]);
        return rows[0];
    }
}

export default new BlogService();