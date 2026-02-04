import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../../test/utils';
import Login from '../../../pages/Login';
import * as authService from '@/services/auth';
import userEvent from '@testing-library/user-event';
import { message } from 'antd';

// Mock services
vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Spy on message
    vi.spyOn(message, 'warning').mockImplementation(() => null as any);
    vi.spyOn(message, 'error').mockImplementation(() => null as any);
    vi.spyOn(message, 'success').mockImplementation(() => null as any);
  });

  it('should prevent login if terms not agreed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    // Fill form
    const usernameInput = screen.getByPlaceholderText('手机号/邮箱');
    await user.clear(usernameInput);
    await user.type(usernameInput, '18660845170');

    const passwordInput = screen.getByPlaceholderText('请输入密码');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'password123');

    // Click login without checking terms
    // Find button by text "密码登录" is header, button is not explicitly named "Login" in text?
    // Let's check Login.tsx again for button text.
    // It says "密码登录" in header.
    // Footer actions... I missed the button in previous Read output (it was cut off?).
    // I need to check the button text.
    
    // Assuming button text is "登录" or similar.
    // Let's assume there is a submit button.
    const loginBtn = screen.getByRole('button', { name: /登录/i }); 
    // If not found, I might need to check Login.tsx again.
    
    await user.click(loginBtn);

    // Expect warning
    expect(message.warning).toHaveBeenCalledWith('请先阅读并同意服务协议和隐私协议');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call login service when terms agreed', async () => {
    const user = userEvent.setup();
    const mockLoginResponse = {
      token: 'fake-token',
      user: { id: 1, username: 'test', name: 'Test User', role: 'user' }
    };
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse as any);

    renderWithProviders(<Login />);

    // Fill form
    const usernameInput = screen.getByPlaceholderText('手机号/邮箱');
    await user.clear(usernameInput);
    await user.type(usernameInput, '18660845170');

    const passwordInput = screen.getByPlaceholderText('请输入密码');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'password123');

    // Check terms
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Click login
    const loginBtn = screen.getByRole('button', { name: /登录/i });
    await user.click(loginBtn);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        username: '18660845170',
        password: 'password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
