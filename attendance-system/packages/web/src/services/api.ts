import { z } from 'zod';
import request from '../utils/request';
import { ApiResponse } from '@attendance/shared';

export const api = request;

/**
 * Validate API response data using Zod schema
 * @param schema Zod schema for the data property
 * @param response Full API response object
 * @returns Validated data
 */
export const validateResponse = <T>(schema: z.ZodType<T>, response: unknown): T => {
  // 1. Validate the outer structure (ApiResponse)
  // We use safeParse for outer structure to avoid double error handling if we only care about data
  // But strictly we should validate everything.
  
  // For now, we assume response matches ApiResponse structure if success is true.
  const apiRes = response as ApiResponse<unknown>;
  if (!apiRes.success) {
    throw new Error(apiRes.error?.message || 'Request failed');
  }

  // 2. Validate the inner data
  return schema.parse(apiRes.data);
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
