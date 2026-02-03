import request, { validateResponse } from '../utils/request';
import { LoginDto, LoginVo, MeVo, ApiResponse } from '@attendance/shared';
import { setToken, setUser, clearAuth } from '../utils/auth';
import { LoginVoSchema, MeVoSchema } from '../schemas/auth';

export const authService = {
  /**
   * 用户登录
   */
  login: async (data: LoginDto) => {
    const res = await validateResponse(
      request.post<any, ApiResponse<LoginVo>>('/auth/login', data),
      LoginVoSchema
    );
    
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
    return validateResponse(
      request.get<any, ApiResponse<MeVo>>('/auth/me'),
      MeVoSchema
    );
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
