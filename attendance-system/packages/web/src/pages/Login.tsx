import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [tab, setTab] = useState<'password' | 'code'>('password');
  const [username, setUsername] = useState('18660845170');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isDark, setIsDark] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'password') {
      try {
        await login({ username, password });
        navigate('/');
      } catch (error) {
        // Error handled in context or show toast here
        console.error('Login failed', error);
      }
    } else {
      console.log('Code login not implemented yet', { phone, code });
      alert('验证码登录暂未接入后端');
    }
  };

  const toggleDarkMode = () => {
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
        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          <button
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              tab === 'password' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setTab('password')}
          >
            密码登录
            {tab === 'password' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              tab === 'code' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setTab('code')}
          >
            验证码登录
            {tab === 'code' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Password Form */}
          <div className={`space-y-6 ${tab === 'password' ? '' : 'hidden'}`}>
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

          {/* Code Form */}
          <div className={`space-y-6 ${tab === 'code' ? '' : 'hidden'}`}>
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                phone_iphone
              </span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                type="text"
                placeholder="手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  verified_user
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  type="text"
                  placeholder="验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button className="px-4 py-3 text-sm text-primary bg-primary/10 hover:bg-primary/20 rounded font-medium whitespace-nowrap transition-colors">
                获取验证码
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-500 dark:text-gray-400">
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
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full mt-8 py-3.5 bg-primary text-white font-semibold rounded shadow-lg shadow-primary/30 hover:bg-primary/90 active:transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
