import fs from "fs/promises";
import path from "path";

import readFileAsync from "../helpers/readFileAsync.js";
import { __dirname } from "../app.js";

// TODO: Change fs logic to PostgreSQL queries
// TODO: Add services layer for business logic
// TODO: Add model layer for PostgreSQL

class BlogController {
    async getBlogPosts(req, res) {
        const blogPosts = await readFileAsync("db", "blog.json");
        res.json(blogPosts);
    }

    async getBlogPostById(req, res) {
        const { id } = req.params;

        const blogPosts = await readFileAsync("db", "blog.json");
        const blogPost = blogPosts.find(post => post.id === id);

        if (!blogPost) {
            res.json({ error: `Blog Post by ID "${id}" not found` })
            return;
        }

        res.json(blogPost);
    }

    async createBlogPost(req, res) {
        const { body } = req;

        // TODO: validate body

        const blogPosts = await readFileAsync("db", "blog.json");
        const newBlogPost = { id: crypto.randomUUID(), ...body };

        // Add new blog post to blog posts
        blogPosts.push(newBlogPost);

        // Update file
        await fs.writeFile(path.join(__dirname, "db", "blog.json"), JSON.stringify(blogPosts, null, 2));
        res.json(newBlogPost);
    }

    async updateBlogPost(req, res) {
        const { id } = req.params;

        const blogPosts = await readFileAsync("db", "blog.json");
        const blogPost = blogPosts.find(post => post.id === id);

        if (!blogPost) res.json({ message: `Blog post by ID ${id} not found` });

        // Update blog post fields
        Object.entries(req.body).forEach(([key, value]) => {
            if (key in blogPost) {
                blogPost[key] = value;
            }
        });

        // Update db
        await fs.writeFile(path.join(__dirname, "db", "blog.json"), JSON.stringify(blogPosts, null, 2));

        res.json(blogPost);
    }

    async deleteBlogPost(req, res) {
        const { id } = req.params;

        const blogPosts = await readFileAsync("db", "blog.json");
        const filteredBlogPosts = blogPosts.filter(post => post.id !== id);

        await fs.writeFile(path.join(__dirname, "db", "blog.json"), JSON.stringify(filteredBlogPosts, null, 2));

        res.json(filteredBlogPosts);
    }
}

export default new BlogController();