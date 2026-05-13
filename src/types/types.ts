import type { Request } from "express";

// Blog post query params type
export type BlogPostQuery = {
    query?: string;
    page?: string;
    limit?: string;
    orderBy?: string;
    order?: string
};

// Blog post body type
export type BlogPostBody = {
    title: string;
    content: string;
}

type Failure = {
    success: boolean;
    error: string;
};

type Success<T> = {
    success: boolean;
    pagination?: Pagination;
    data: T;
    message?: string;
    token?: string;
}

// API Response type
export type ApiResponse<T> = Success<T> | Failure;

// Pagination type
export type Pagination = {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Blog post type
export type BlogPost = {
    id: number;
    title: string;
    content: string;
    authorId: number;
    createdAt: Date;
}

// Update blog post service props type
export type UpdateBlogPostProps = {
    id: number;
    data: Partial<BlogPostBody>;
}

// login type
export type LoginBody = {
    email: string;
    password: string;
}

export type RegisterBody = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export type User = {
    id: number;
    name: string;
    email: string;
    password: string;
}

// Typed Request with userId attached
export type AuthRequest<
    Params = {},
    ResBody = {},
    ReqBody = {},
    Query = {},
> = Request<Params, ResBody, ReqBody, Query> & {
    userId?: number;
}