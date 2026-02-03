import { z } from 'zod';
import { api, validateResponse } from './api';
import { LoginDto, LoginVo } from '@attendance/shared';
import { LoginVoSchema } from '../schemas/auth';
import { ApiResponse } from '@attendance/shared';

export const login = async (data: LoginDto): Promise<LoginVo> => {
  const res = await api.post<unknown, ApiResponse<LoginVo>>('/auth/login', data);
  return validateResponse(LoginVoSchema, res);
};

export const logout = async (): Promise<void> => {
    // Assuming there might be a server-side logout, otherwise this might just be local.
    // But typically JWT is stateless, so maybe no server call needed unless for blacklist.
    // For now, we'll assume just local, but if there was an API:
    // const res = await api.post<unknown, ApiResponse<void>>('/auth/logout');
    // return validateResponse(z.void(), res);
    return Promise.resolve();
};
