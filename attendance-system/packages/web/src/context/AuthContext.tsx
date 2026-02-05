import React, { createContext, useContext, useState } from 'react';
import { LoginDto } from '@attendance/shared';
import { getToken, getUser, setToken, setUser as setStorageUser, clearAuth, AuthUser } from '../utils/auth';
import { login as loginService } from '../services/auth';
import { useToast } from '../components/common/ToastProvider';
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
  const { toast } = useToast();
  const [user, setUserState] = useState<AuthUser | null>(() => getUser());
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading] = useState(false);

  const login = async (loginData: LoginDto): Promise<void> => {
    try {
      const { token, user } = await loginService(loginData);
      
      setToken(token);
      setStorageUser(user);
      setTokenState(token);
      setUserState(user);
      toast.success('登录成功');
    } catch (error: unknown) {
      logger.error('Login failed', error);
      throw error;
    }
  };

  const logout = (): void => {
    logger.info('User logging out', { userId: user?.id, username: user?.username });
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
