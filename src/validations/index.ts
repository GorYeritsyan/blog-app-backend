import joi from "joi";
import type { LoginBody, RegisterBody, BlogPostBody } from "../types/types.js";

// Blog post
export const createBlogPostSchema = joi.object<BlogPostBody>({
    title: joi.string().min(3).max(255).required()
        .messages({
            'string.base': 'Title must be text',
            'string.empty': 'Title cannot be empty',
            'string.min': 'Title must be at least {{#limit}} characters',
            'string.max': 'Title must be at most {{#limit}} characters',
            'any.required': 'Title is required',
        }),
    content: joi.string().min(3).max(255).required()
        .messages({
            'string.base': 'Content must be text',
            'string.empty': 'Content cannot be empty',
            'string.min': 'Content must be at least {{#limit}} characters',
            'string.max': 'Content must be at most {{#limit}} characters',
            'any.required': 'Content is required',
        }),
    tags: joi.array().items(joi.string())
        .messages({
            'array.base': 'Tags must be an array',
            'array.includes': 'Tags can only contain text values',
        }),
});

export const updateBlogPostSchema = joi.object<Partial<BlogPostBody>>({
    title: joi.string().min(3).max(255)
        .messages({
            'string.base': 'Title must be text',
            'string.empty': 'Title cannot be empty',
            'string.min': 'Title must be at least {{#limit}} characters',
            'string.max': 'Title must be at most {{#limit}} characters',
        }),
    content: joi.string().min(3).max(255)
        .messages({
            'string.base': 'Content must be text',
            'string.empty': 'Content cannot be empty',
            'string.min': 'Content must be at least {{#limit}} characters',
            'string.max': 'Content must be at most {{#limit}} characters',
        }),
    tags: joi.array().items(joi.string())
        .messages({
            'array.base': 'Tags must be an array',
            'array.includes': 'Tags can only contain text values',
        }),
});

// Auth
// Login schema
export const loginSchema = joi.object<LoginBody>({
    email: joi.string().email().required()
        .messages({
            'string.base': 'Email must be text',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required',
        }),
    password: joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required()
        .messages({
            'string.base': 'Password must be text',
            'string.empty': 'Password cannot be empty',
            'string.pattern.base': 'Password must be 3-30 characters and contain only letters and numbers',
            'any.required': 'Password is required',
        }),
});

export const registerSchema = joi.object<RegisterBody>({
    name: joi.string().min(3).max(255).required()
        .messages({
            'string.base': 'Name must be text',
            'string.empty': 'Name cannot be empty',
            'string.min': 'Name must be at least {{#limit}} characters',
            'string.max': 'Name must be at most {{#limit}} characters',
            'any.required': 'Name is required',
        }),
    email: joi.string().email().required()
        .messages({
            'string.base': 'Email must be text',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required',
        }),
    password: joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required()
        .messages({
            'string.base': 'Password must be text',
            'string.empty': 'Password cannot be empty',
            'string.pattern.base': 'Password must be 3-30 characters and contain only letters and numbers',
            'any.required': 'Password is required',
        }),
    confirmPassword: joi.ref("password"),
});

// Chat
export const groupChatSchema = joi.object({
    name: joi.string().min(3).max(255).required()
        .messages({
            'string.base': 'Name must be text',
            'string.empty': 'Name cannot be empty',
            'string.min': 'Name must be at least {{#limit}} characters',
            'string.max': 'Name must be at most {{#limit}} characters',
            'any.required': 'Name is required',
        }),
    memberIds: joi.array().items(joi.number()).min(1).required()
        .messages({
            'array.base': 'Member IDs must be an array',
            'array.includes': 'Member IDs can only contain numbers',
            'array.min': 'Member IDs must include at least {{#limit}} member',
            'any.required': 'Member IDs is required',
        }),
});

// Product
export const productSchema = joi.object({
    title: joi.string().min(3).max(255).required()
        .messages({
            'string.base': 'Title must be text',
            'string.empty': 'Title cannot be empty',
            'string.min': 'Title must be at least {{#limit}} characters',
            'string.max': 'Title must be at most {{#limit}} characters',
            'any.required': 'Title is required',
        }),
    price: joi.number().required()
        .messages({
            'number.base': 'Price must be a number',
            'any.required': 'Price is required',
        }),
});