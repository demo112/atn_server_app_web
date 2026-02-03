import axios, { AxiosError } from 'axios';
import { message } from 'antd';
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
          message.error(errorMessage);
          break;
        case 401:
          message.error('Session expired, please login again');
          clearAuth();
          window.location.href = '/login';
          break;
        case 403:
          message.error('Permission denied');
          break;
        case 404:
          message.error('Resource not found');
          break;
        case 500:
          message.error('Server error, please try again later');
          break;
        default:
          message.error(errorMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received
      message.error('Network error, please check your connection');
    } else {
      // Something happened in setting up the request that triggered an Error
      message.error('Request configuration error');
    }
    return Promise.reject(error);
  }
);

export default request;
