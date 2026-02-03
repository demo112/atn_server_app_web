import { ApiResponse, PaginatedResponse } from '@attendance/shared';

// 成功响应
export function success<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

// 分页响应
export function paginated<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number
): ApiResponse<PaginatedResponse<T>> {
  return {
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

// 错误响应
export function error(code: string, message: string): ApiResponse<never> {
  return { success: false, error: { code, message } };
}

// 常用错误
export const errors = {
  notFound: (resource: string) => error(`ERR_${resource.toUpperCase()}_NOT_FOUND`, `${resource} not found`),
  unauthorized: () => error('ERR_UNAUTHORIZED', 'Unauthorized'),
  forbidden: () => error('ERR_FORBIDDEN', 'Forbidden'),
  badRequest: (message: string) => error('ERR_BAD_REQUEST', message),
  internal: () => error('ERR_INTERNAL', 'Internal server error'),
};
