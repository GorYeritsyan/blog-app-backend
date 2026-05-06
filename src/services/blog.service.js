import db from "../db/index.js";

class BlogService {
    async getBlogPosts() {
        const { rows } = await db.query("SELECT * FROM blog");
        return rows;
    }

    async getBlogPostById(id) {
        const { rows } = await db.query("SELECT * FROM blog WHERE id = $1", [id]);
        return rows[0];
    }
}

export default new BlogService();