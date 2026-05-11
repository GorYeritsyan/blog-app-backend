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
export type ApiResponse<T> = { success: boolean; data: T; pagination?: TPagination } | { success: boolean; message: string };

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
    author: string;
    created_at: string;
}

// Update blog post service props type
export type TUpdateBlogPostProps = {
    id: number;
    updateQueryString: string;
    values: string[];
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