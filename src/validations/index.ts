import joi from 'joi';
import type { LoginBody, RegisterBody, BlogPostBody } from "../types/types.js";

export const createBlogPostSchema = joi.object<BlogPostBody>({
    title: joi.string().min(3).max(255).required(),
    content: joi.string().min(3).max(255).required(),
});

export const updateBlogPostSchema = joi.object<Partial<BlogPostBody>>({
    title: joi.string().min(3).max(255),
    content: joi.string().min(3).max(255),
});

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