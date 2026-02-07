import axios, { AxiosError } from 'axios';
import { toast } from '@/components/common/ToastProvider';
import { getToken, clearAuth } from './auth';

const translateError = (code?: string, msg?: string): string => {
  const codeMap: Record<string, string> = {
    ERR_AUTH_MISSING_TOKEN: '缺少认证信息',
    ERR_AUTH_INVALID_TOKEN: '认证信息格式错误',
    ERR_AUTH_TOKEN_EXPIRED: '认证信息已过期或无效',
    ERR_AUTH_NO_EMPLOYEE: '当前用户未关联员工',
    ERR_VALIDATION: '参数验证失败',
    ERR_INTERNAL: '服务器内部错误',
    ERR_NOT_FOUND: '资源不存在',
    ERR_CONFLICT: '存在冲突，操作失败',
  };
  if (code && codeMap[code]) return codeMap[code];
  const phraseMap: Array<{ test: (m: string) => boolean; zh: string }> = [
    { test: (m) => m.includes('Invalid credentials'), zh: '账号或密码错误' },
    { test: (m) => m.includes('No token provided'), zh: '缺少认证信息' },
    { test: (m) => m.includes('Invalid token format'), zh: '认证信息格式错误' },
    { test: (m) => m.includes('Token expired or invalid'), zh: '认证信息已过期或无效' },
  ];
  if (msg) {
    const matched = phraseMap.find(p => p.test(msg));
    if (matched) return matched.zh;
    return msg;
  }
  return '请求失败';
};

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
  (error: AxiosError<{ message?: string; error?: { message?: string; code?: string } }>) => {
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = translateError(data?.error?.code, data?.message || data?.error?.message);

      if (data?.error?.code === 'ERR_VALIDATION' && (data.error as any).details) {
         const details = (data.error as any).details;
         const detailMsg = Array.isArray(details) 
            ? details.map((d: any) => `${d.path}: ${d.message}`).join(', ')
            : JSON.stringify(details);
         errorMessage += `: ${detailMsg}`;
      }

      switch (status) {
        case 400:
          toast.error(errorMessage);
          break;
        case 401:
          toast.error('会话已过期，请重新登录');
          clearAuth();
          window.location.href = '/login';
          break;
        case 403:
          toast.error('无权限');
          break;
        case 404:
          toast.error('资源不存在');
          break;
        case 500:
          toast.error('服务器错误，请稍后重试');
          break;
        default:
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('网络错误，请检查网络连接');
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('请求配置错误');
    }
    return Promise.reject(error);
  }
);

export default request;
