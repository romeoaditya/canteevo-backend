import type { ApiResponse, PaginatedResponse } from '../interfaces/response.interface.js';

export function createSuccessResponse<T>(message: string, data: T): ApiResponse<T> {
    return { message, data };
}

export function createPaginatedResponse<T>(
    message: string,
    items: T[],
    totalItems: number,
    currentPage: number,
    pageSize: number,
): PaginatedResponse<T> {
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
        message,
        data: {
            items,
            page: { totalItems, totalPages, currentPage, pageSize },
        },
    };
}

export function getPaginationParams(page?: number, limit?: number) {
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? Math.min(limit, 100) : 10;
    const skip = (currentPage - 1) * pageSize;

    return { currentPage, pageSize, skip, take: pageSize };
}
