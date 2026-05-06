import db from "../db/index.js";

class BlogService {
    // TODO: Implement filter, sort and pagination logic
    // Get all blog posts
    async getBlogPosts({ limit = 10, offset = 0 }) {
        const { rows } = await db.query("SELECT * FROM blog ORDER BY id DESC LIMIT $1 OFFSET $2",
            [limit, offset]);
        return rows;
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