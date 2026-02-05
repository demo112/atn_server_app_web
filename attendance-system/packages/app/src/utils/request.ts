import axios, { AxiosError, AxiosResponse } from 'axios';
import { Alert } from 'react-native';
import { getToken, clearAuth } from './auth';
import { z } from 'zod';
import { ApiResponse } from '@attendance/shared';
import { logger } from './logger';
import { analyzeErrorResponse } from './error-handler';

// Use local IP for Android Emulator (10.0.2.2) or physical device (LAN IP)
// localhost works for iOS simulator but not Android
// For Android Emulator, 10.0.2.2 is the special alias to your host loopback interface (127.0.0.1)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api/v1';

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const validateResponse = async <T>(
  promise: Promise<ApiResponse<any>>, 
  schema: z.ZodType<T, any, any>
): Promise<T> => {
  const response = await promise;
  
  if (!response.success) {
    throw new Error(response.error?.message || 'Request failed');
  }

  // Handle void schema (for delete operations)
  if (schema instanceof z.ZodVoid) {
    return undefined as T;
  }

  const result = schema.safeParse(response.data);
  if (!result.success) {
    // Fallback: if schema expects array but server wraps in { items }, try parsing items
    try {
      if (schema instanceof z.ZodArray && response && typeof response.data === 'object' && response.data && 'items' in (response.data as any)) {
        const alt = schema.safeParse((response.data as any).items);
        if (alt.success) {
          return alt.data as T;
        }
      }
    } catch { /* no-op */ }
    logger.error('Response validation failed:', result.error);
    throw new Error('Response validation failed');
  }
  
  return result.data;
};

request.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError<{ message?: string; error?: { message?: string } }>) => {
    if (error.response) {
      const { status, data } = error.response;
      const action = analyzeErrorResponse(status, data);

      switch (action.type) {
        case 'ALERT':
          Alert.alert(action.title, action.message);
          break;
        case 'CLEAR_AUTH_AND_ALERT':
          Alert.alert(action.title, action.message);
          await clearAuth();
          break;
        case 'REJECT':
          // Default behavior for unhandled cases if any
          break;
      }
    } else if (error.request) {
      Alert.alert('Network Error', 'Please check your internet connection');
    } else {
      Alert.alert('Error', 'Request configuration error');
    }
    return Promise.reject(error);
  }
);

export default request;
