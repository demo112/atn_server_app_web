import request from '../utils/request';
import { LoginDto, LoginVo, MeVo, ApiResponse } from '@attendance/shared';
import { setToken, setUser, clearAuth } from '../utils/auth';

export const authService = {
  /**
   * 用户登录
   */
  login: async (data: LoginDto) => {
    // request.post returns the response body (ApiResponse or data)
    // Assuming backend returns LoginVo directly or inside ApiResponse?
    // Based on auth.service.ts, it returns LoginVo.
    // Based on API contract, it usually returns { success: true, data: LoginVo } or just LoginVo.
    // Let's assume request handles wrapping/unwrapping or returns what backend sends.
    // However, existing LoginScreen uses request.post<any, LoginVo> and expects res.token.
    // This implies the backend returns the object directly OR the interceptor unwraps 'data'.
    
    const res = await request.post<any, LoginVo>('/auth/login', data);
    
    if (res.token) {
      await setToken(res.token);
      await setUser(res.user);
    }
    return res;
  },

  /**
   * 获取当前用户信息
   */
  getMe: async () => {
    // Existing code returned ApiResponse<MeVo>
    return request.get<any, ApiResponse<MeVo>>('/auth/me');
  },

  /**
   * 退出登录
   */
  logout: async () => {
    await clearAuth();
    // Optional: Call backend logout endpoint if exists
  }
};

// Named export for backward compatibility
export const getMe = authService.getMe;
