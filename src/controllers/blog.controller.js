import blogService from "../services/blog.service.js";
import {createBlogPostSchema, updateBlogPostSchema} from "../validations/index.js";

// TODO: Change fs logic to PostgreSQL queries
// TODO: Add services layer for business logic
// TODO: Add model layer for PostgreSQL

class BlogController {
    async getBlogPosts(req, res) {
        const blogPosts = await blogService.getBlogPosts();
        res.json(blogPosts);
    }

    async getBlogPostById(req, res) {
        const { id } = req.params;

        const blogPost = await blogService.getBlogPostById(id);

        if (!blogPost) {
            res.json({ error: `Blog Post by ID ${id} not found` })
            return;
        }

        res.json(blogPost);
    }

    async createBlogPost(req, res) {
        try {
            // Validate request body
            const validBody = await createBlogPostSchema.validateAsync(req.body);

            const newBlogPost = await blogService.createBlogPost(validBody);

            res.json(newBlogPost);
        } catch (err) {
            res.json({ success: false, message: err.message });
        }
    }

    async updateBlogPost(req, res) {
        const { id } = req.params;

        // Create query strings from these arrays later on for update request
        const queryUpdates = [];
        const queryValues = [];

        try {
            // Validate request body
            const validBody = await updateBlogPostSchema.validateAsync(req.body);

            // Fill query arrays
            Object.entries(validBody).forEach(([key, value]) => {
                queryValues.push(value);

                // title = $1, content = $2, etc...
                queryUpdates.push(`${key} = $${queryValues.length}`);
            });

            // Get blog post by ID
            const blogPost = await blogService.getBlogPostById(id);

            // Handle Not found case
            if (!blogPost) {
                res.json({ error: `Blog Post by ID ${id} not found` });
                return;
            }

            // Update blog post by id
            try {
                const updatedBlogPost = await blogService.updateBlogPost({ id, updateQueryString: queryUpdates.join(", "), values: queryValues });
                res.status(200).json({ success: true, data: updatedBlogPost });
            } catch (err) {
                res.status(500).json({ success: false, error: `Something went wrong when updating blog post by ID ${id}` });
            }
        } catch (err) {
            res.json({ message: err.message });
        }
    }

    async deleteBlogPost(req, res) {
        const { id } = req.params;

        const deletedBlogPost = await blogService.deleteBlogPost(id);

        res.json(deletedBlogPost);
    }
}

export default new BlogController();