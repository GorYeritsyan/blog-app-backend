import type { Request } from "express";

// Blog post query params type
export type TBlogPostQuery = {
    query?: string;
    page?: string;
    limit?: string;
    orderBy?: string;
    order?: string
};

// Blog post body type
export type TBlogPostBody = {
    title: string;
    content: string;
}

// API Response type
export type ApiResponse<T> = { success: boolean; data: T; message?: string; pagination?: TPagination } | { success: boolean; error: string };

// Pagination type
export type TPagination = {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Blog post type
export type TBlogPost = {
    id: number;
    title: string;
    content: string;
    authorId: number;
    createdAt: Date;
}

// Update blog post service props type
export type TUpdateBlogPostProps = {
    id: number;
    data: Partial<TBlogPostBody>;
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

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>