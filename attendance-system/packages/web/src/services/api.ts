import request from '@/utils/request';

export const api = request;

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // Debug log for request data
    // console.log(`API Request [${config.method?.toUpperCase()} ${config.url}] Data:`, config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
