import db from "../db/index.js";

class BlogService {
    // Get all blog posts
    async getBlogPosts() {
        const { rows } = await db.query("SELECT * FROM blog");
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

    async updateBlogPost({ id, updateQueryString, values }) {
        console.log(updateQueryString);
        const { rows } = await db.query(`UPDATE blog SET ${updateQueryString} WHERE id = ${id} RETURNING *`, values);
        return rows[0];
    }

    // Delete blog post by id
    async deleteBlogPost(id) {
        const { rows } = await db.query("DELETE FROM blog WHERE id = $1 RETURNING *", [id]);
        return rows[0];
    }
}

export default new BlogService();