import joi from 'joi';
import type { LoginBody, RegisterBody, BlogPostBody } from "../types/types.js";

// Blog post
export const createBlogPostSchema = joi.object<BlogPostBody>({
    title: joi.string().min(3).max(255).required(),
    content: joi.string().min(3).max(255).required(),
    tags: joi.array().items(joi.string()),
});

export const updateBlogPostSchema = joi.object<Partial<BlogPostBody>>({
    title: joi.string().min(3).max(255),
    content: joi.string().min(3).max(255),
    tags: joi.array().items(joi.string()),
});

// Auth
// Login schema
export const loginSchema = joi.object<LoginBody>({
    email: joi.string().email().required(),
    password: joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required(),
});

export const registerSchema = joi.object<RegisterBody>({
    name: joi.string().min(3).max(255).required(),
    email: joi.string().email().required(),
    password:  joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required(),
    confirmPassword: joi.ref("password"),
});

// Chat
export const groupChatSchema = joi.object({
    name: joi.string().min(3).max(255).required(),
    memberIds: joi.array().items(joi.number()).min(1).required(),
});

// Product
export const productSchema = joi.object({
    title: joi.string().min(3).max(255).required(),
    price: joi.number().required(),
});