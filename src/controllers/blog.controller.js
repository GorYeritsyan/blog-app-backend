import blogService from "../services/blog.service.js";
import { createBlogPostSchema, updateBlogPostSchema } from "../validations/index.js";

class BlogController {
    async getBlogPosts(req, res) {
        const { query, page = 1, limit = 10, orderBy = "created_at", order = "asc" } = req.query;

        const { data, totalPages } = await blogService.getBlogPosts({ query, limit, page, orderBy, order: order.toUpperCase() });

        // Pagination
        const pagination = { totalPages, hasNext: +page < totalPages, hasPrev: +page > 1, currentPage: +page };

        res.json({ success: true, pagination, data });
    }

    async getBlogPostById(req, res) {
        const { id } = req.params;

        const blogPost = await blogService.getBlogPostById(id);

        if (!blogPost) {
            res.json({ success: false, message: `Blog Post by ID ${id} not found` })
            return;
        }

        res.json({ success: true, data: blogPost });
    }

    async createBlogPost(req, res) {
        try {
            // Validate request body
            const validBody = await createBlogPostSchema.validateAsync(req.body);

            const newBlogPost = await blogService.createBlogPost(validBody);

            res.json({ success: true, data: newBlogPost });
        } catch (err) {
            res.json({ success: false, message: err.message });
        }
    }

    async updateBlogPost(req, res) {
        const { id } = req.params;

        // Create query strings from these arrays later on for update request
        const updateQueryArray = [];
        const updateQueryValues = [];

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
            const blogPost = await blogService.getBlogPostById(id);

            // Handle Not found case
            if (!blogPost) {
                res.json({ success: false, message: `Blog Post by ID ${id} not found` });
                return;
            }

            // Update blog post by id
            try {
                const updatedBlogPost = await blogService.updateBlogPost({ id, updateQueryString: updateQueryArray.join(", "), values: updateQueryValues });
                res.status(200).json({ success: true, data: updatedBlogPost });
            } catch (err) {
                res.status(500).json({ success: false, message: `Something went wrong when updating blog post by ID ${id}` });
            }
        } catch (err) {
            res.json({ success: false, message: err.message });
        }
    }

    async deleteBlogPost(req, res) {
        const { id } = req.params;

        const deletedBlogPost = await blogService.deleteBlogPost(id);

        res.json({ success: true, data: deletedBlogPost });
    }
}

export default new BlogController();