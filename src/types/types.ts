export type TBlogPostQuery = {
    query?: string;
    page?: string;
    limit?: string;
    orderBy?: string;
    order?: string
};

export type TBlogPostBody = {
    title: string;
    content: string;
    author: string;
}

// API Response type
export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    pagination?: TPagination;
    message?: string;
}

export type TPagination = {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export type TBlogPost = {
    id: number;
    title: string;
    content: string;
    author: string;
    created_at: string;
}

export type TUpdateBlogPostProps = {
    id: number;
    updateQueryString: string;
    values: string[]
}