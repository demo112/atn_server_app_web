import { z } from 'zod';
import request from '../utils/request';
import { ApiResponseSchema } from '../schemas/common';

export const api = request;

/**
 * Validate API response data using Zod schema
 * @param schema Zod schema for the data property
 * @param response Full API response object
 * @returns Validated data
 */
export const validateResponse = <T>(schema: z.ZodType<T>, response: any): T => {
  // 1. Validate the outer structure (ApiResponse)
  // We use safeParse for outer structure to avoid double error handling if we only care about data
  // But strictly we should validate everything.
  
  // For now, we assume response matches ApiResponse structure if success is true.
  if (!response.success) {
    throw new Error(response.error?.message || 'Request failed');
  }

  // 2. Validate the inner data
  return schema.parse(response.data);
};

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
