import joi from "joi";
import type { LoginBody, RegisterBody, BlogPostBody } from "../types/types.js";

// Blog post
export const createBlogPostSchema = joi.object<BlogPostBody>({
    title: joi.string().min(3).max(255).required()
        .label("Title")
        .messages({
            'string.base': '{{#label}} must be text',
            'string.empty': '{{#label}} cannot be empty',
            'string.min': '{{#label}} must be at least {{#limit}} characters',
            'string.max': '{{#label}} must be at most {{#limit}} characters',
            'any.required': '{{#label}} is required',
        }),
    content: joi.string().min(3).max(255).required()
        .label('Content')
        .messages({
            'string.base': '{{#label}} must be text',
            'string.empty': '{{#label}} cannot be empty',
            'string.min': '{{#label}} must be at least {{#limit}} characters',
            'string.max': '{{#label}} must be at most {{#limit}} characters',
            'any.required': '{{#label}} is required',
        }),
    tags: joi.array().items(joi.string())
        .label('Tags')
        .messages({
            'array.base': '{{#label}} must be an array',
            'array.includes': '{{#label}} can only contain text values',
        }),
});

export const updateBlogPostSchema = joi.object<Partial<BlogPostBody>>({
    title: joi.string().min(3).max(255)
        .label('Title')
        .messages({
            'string.base': '{{#label}} must be text',
            'string.empty': '{{#label}} cannot be empty',
            'string.min': '{{#label}} must be at least {{#limit}} characters',
            'string.max': '{{#label}} must be at most {{#limit}} characters',
        }),
    content: joi.string().min(3).max(255)
        .label('Content')
        .messages({
            'string.base': '{{#label}} must be text',
            'string.empty': '{{#label}} cannot be empty',
            'string.min': '{{#label}} must be at least {{#limit}} characters',
            'string.max': '{{#label}} must be at most {{#limit}} characters',
        }),
    tags: joi.array().items(joi.string())
        .label('Tags')
        .messages({
            'array.base': '{{#label}} must be an array',
            'array.includes': '{{#label}} can only contain text values',
        }),
});

// Auth
// Login schema
export const loginSchema = joi.object<LoginBody>({
    email: joi.string().email().required()
        .label('Email')
        .messages({
            'string.base': '{{#label}} must be text',
            'string.empty': '{{#label}} cannot be empty',
            'string.email': '{{#label}} must be a valid email address',
            'any.required': '{{#label}} is required',
        }),
    password: joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required()
        .label('Password')
        .messages({
            'string.base': '{{#label}} must be text',
            'string.empty': '{{#label}} cannot be empty',
            'string.pattern.base': '{{#label}} must be 3-30 characters and contain only letters and numbers',
            'any.required': '{{#label}} is required',
        }),
});

export const registerSchema = joi.object<RegisterBody>({
    name: joi.string().min(3).max(255).required()
        .label('Name')
        .messages({
            'string.base': '{{#label}} must be text',
            'string.empty': '{{#label}} cannot be empty',
            'string.min': '{{#label}} must be at least {{#limit}} characters',
            'string.max': '{{#label}} must be at most {{#limit}} characters',
            'any.required': '{{#label}} is required',
        }),
    email: joi.string().email().required()
        .label('Email')
        .messages({
            'string.base': '{{#label}} must be text',
            'string.empty': '{{#label}} cannot be empty',
            'string.email': '{{#label}} must be a valid email address',
            'any.required': '{{#label}} is required',
        }),
    password: joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required()
        .label('Password')
        .messages({
            'string.base': '{{#label}} must be text',
            'string.empty': '{{#label}} cannot be empty',
            'string.pattern.base': '{{#label}} must be 3-30 characters and contain only letters and numbers',
            'any.required': '{{#label}} is required',
        }),
    confirmPassword: joi.ref("password"),
});

// Chat
export const groupChatSchema = joi.object({
    name: joi.string().min(3).max(255).required()
        .label('Name')
        .messages({
            'string.base': '{{#label}} must be text',
            'string.empty': '{{#label}} cannot be empty',
            'string.min': '{{#label}} must be at least {{#limit}} characters',
            'string.max': '{{#label}} must be at most {{#limit}} characters',
            'any.required': '{{#label}} is required',
        }),
    memberIds: joi.array().items(joi.number()).min(1).required()
        .label('Member IDs')
        .messages({
            'array.base': '{{#label}} must be an array',
            'array.includes': '{{#label}} can only contain numbers',
            'array.min': '{{#label}} must include at least {{#limit}} member',
            'any.required': '{{#label}} is required',
        }),
});

// Product
export const productSchema = joi.object({
    title: joi.string().min(3).max(255).required()
        .label('Title')
        .messages({
            'string.base': '{{#label}} must be text',
            'string.empty': '{{#label}} cannot be empty',
            'string.min': '{{#label}} must be at least {{#limit}} characters',
            'string.max': '{{#label}} must be at most {{#limit}} characters',
            'any.required': '{{#label}} is required',
        }),
    price: joi.number().required()
        .label('Price')
        .messages({
            'number.base': '{{#label}} must be a number',
            'any.required': '{{#label}} is required',
        }),
});