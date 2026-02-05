import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LoginDto } from '@attendance/shared';
import { useToast } from '@/components/common/ToastProvider';

const Login: React.FC = (): React.ReactElement => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [isDark, setIsDark] = useState(false);

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!username.trim() || !password) {
      toast.warning('请输入用户名和密码');
      return;
    }

    if (!agreed) {
      toast.warning('请先阅读并同意服务协议和隐私协议');
      return;
    }
    try {
      const loginData: LoginDto = { username, password };
      await login(loginData);
      navigate('/');
    } catch {
      // Error handled in context or show toast here
    }
  };

  const toggleDarkMode = (): void => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          <div className="flex-1 py-4 text-center font-medium text-primary relative">
            密码登录
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Password Form */}
          <div className="space-y-6">
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                person_outline
              </span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                type="text"
                placeholder="手机号/邮箱"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                lock_outline
              </span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <a href="#" className="text-sm text-primary hover:underline">
                忘记密码
              </a>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
            </div>
            <div className="ml-3 text-sm">
            <label className="text-gray-500 dark:text-gray-400" htmlFor="terms">
              我已阅读并接受{' '}
              <a href="#" className="text-primary hover:underline">
                服务协议
              </a>{' '}
              和{' '}
              <a href="#" className="text-primary hover:underline">
                隐私协议
              </a>
            </label>
          </div>
        </div>

        <button
          className="w-full mt-12 py-3.5 bg-primary !text-white font-semibold rounded shadow-lg shadow-primary/30 hover:bg-primary/90 active:transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? '登录中...' : '登录'}
        </button>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">您还没有账户？</span>
            <a href="#" className="text-primary font-medium hover:underline">
              立即注册
            </a>
          </div>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed bottom-6 right-6 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform"
      >
        <span className="material-icons">
          {isDark ? 'light_mode' : 'dark_mode'}
        </span>
      </button>
    </div>
  );
};

export default Login;
