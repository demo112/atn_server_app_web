import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@attendance/shared';
import { getToken, getUser, setToken, setUser as setStorageUser, clearAuth } from '../utils/auth';
import request from '../utils/request';
import { message } from 'antd';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (loginData: any) => {
    try {
      const res: any = await request.post('/auth/login', loginData);
      if (res.success) {
        const { token, user } = res.data;
        setToken(token);
        setStorageUser(user);
        setTokenState(token);
        setUserState(user);
        message.success('登录成功');
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.error?.message || '登录失败');
      throw error;
    }
  };

  const logout = () => {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
