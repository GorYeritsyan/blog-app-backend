import joi from 'joi';
import type {TBlogPostBody} from "../types/types.ts";

export const createBlogPostSchema = joi.object<TBlogPostBody>({
    title: joi.string().max(255).required(),
    content: joi.string().max(255).required(),
    author: joi.string().max(100).required(),
});

export const updateBlogPostSchema = joi.object({
    title: joi.string().max(255),
    content: joi.string().max(255),
    author: joi.string().max(100),
});