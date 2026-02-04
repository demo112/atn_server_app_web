import axios, { AxiosError } from 'axios';
import { toast } from '@/components/common/ToastProvider';
import { getToken, clearAuth } from './auth';

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

// Request interceptor
request.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<{ message?: string; error?: { message?: string } }>) => {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || data?.error?.message || 'Request failed';

      switch (status) {
        case 400:
          toast.error(errorMessage);
          break;
        case 401:
          toast.error('Session expired, please login again');
          clearAuth();
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Permission denied');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error, please try again later');
          break;
        default:
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Network error, please check your connection');
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('Request configuration error');
    }
    return Promise.reject(error);
  }
);

export default request;
