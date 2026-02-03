import axios, { AxiosError, AxiosResponse } from 'axios';
import { Alert } from 'react-native';
import { getToken, clearAuth } from './auth';
import { z } from 'zod';
import { ApiResponse } from '@attendance/shared';
import { logger } from './logger';

// Use local IP for Android Emulator or physical device
// localhost works for iOS simulator but not Android
// You might need to change this to your machine's IP
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.134:3000/api/v1';

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
      const errorMessage = data?.message || data?.error?.message || 'Request failed';

      switch (status) {
        case 400:
          Alert.alert('Error', errorMessage);
          break;
        case 401:
          Alert.alert('Session Expired', 'Please login again');
          await clearAuth();
          // Navigation logic to redirect to login might be needed here
          // or handle it in the UI by checking token existence
          break;
        case 403:
          Alert.alert('Permission Denied', 'You do not have permission to perform this action');
          break;
        case 404:
          Alert.alert('Error', 'Resource not found');
          break;
        case 500:
          Alert.alert('Server Error', 'Please try again later');
          break;
        default:
          Alert.alert('Error', errorMessage);
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
