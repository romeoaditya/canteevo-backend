/** Standard success response */
export interface ApiResponse<T> {
    message: string;
    data: T;
}

/** Pagination metadata */
export interface PageMetadata {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
    message: string;
    data: {
        items: T[];
        page: PageMetadata;
    };
}

/** Error response */
export interface ErrorResponse {
    message: string;
    error: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    requestId?: string;
}
