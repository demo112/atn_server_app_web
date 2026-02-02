import axios from 'axios';
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
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default request;
