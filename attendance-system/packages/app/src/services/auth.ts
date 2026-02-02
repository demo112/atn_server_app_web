import request from '../utils/request';
import { ApiResponse, MeVo } from '@attendance/shared';

/**
 * 获取当前用户信息
 */
export const getMe = () => {
  return request.get<any, ApiResponse<MeVo>>('/auth/me');
};
