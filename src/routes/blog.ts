import { Router } from "express";
import blogController from "../controllers/blog.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

// Get All blog posts - GET /api/blog
router.get("/", auth, blogController.getBlogPosts);

// Get blog post by id - GET /api/blog/:id
router.get("/:id", blogController.getBlogPostById);

// Create new blog post - POST /api/blog
router.post("/", blogController.createBlogPost);

// Update blog post - PATCH /api/blog/:id
router.patch("/:id", blogController.updateBlogPost);

// Delete blog post - DELETE /api/blog/:id
router.delete("/:id", blogController.deleteBlogPost);

export default router;