import React, { createContext, useContext, useState } from 'react';
import { LoginDto } from '@attendance/shared';
import { getToken, getUser, setToken, setUser as setStorageUser, clearAuth, AuthUser } from '../utils/auth';
import request from '../utils/request';
import { validateResponse } from '../services/api';
import { LoginVoSchema } from '../schemas/auth';
import { message } from 'antd';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<AuthUser | null>(() => getUser());
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading] = useState(false);

  const login = async (loginData: LoginDto): Promise<void> => {
    try {
      const res = await request.post<unknown, { success: boolean; data: unknown; }>('/auth/login', loginData);
      if (res.success) {
        // Runtime validation
        const { token, user } = validateResponse(LoginVoSchema, res);
        
        setToken(token);
        setStorageUser(user);
        setTokenState(token);
        setUserState(user);
        message.success('登录成功');
      }
    } catch (error: unknown) {
      logger.error('Login failed', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      message.error(err.response?.data?.error?.message || '登录失败');
      throw error;
    }
  };

  const logout = (): void => {
    clearAuth();
    setTokenState(null);
    setUserState(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
