import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import Login from '../../pages/Login';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../components/common/ToastProvider';

// Mock child components to simplify integration test
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('Login Integration', () => {
  beforeAll(() => {
    // Suppress console.error for expected errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    mockedNavigate.mockClear();
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should render login form', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    );

    expect(screen.getByPlaceholderText('手机号/邮箱')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^登录$/ })).toBeInTheDocument();
  });

  it('should prevent login if terms not agreed', async () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    );

    // Fill form but don't check terms
    await userEvent.type(screen.getByPlaceholderText('手机号/邮箱'), 'admin');
    await userEvent.type(screen.getByPlaceholderText('请输入密码'), '123456');
    
    // Click login
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    // Verify warning
    expect(await screen.findByText('请先阅读并同意服务协议和隐私协议')).toBeInTheDocument();
    
    // Verify API was NOT called
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('should handle successful login', async () => {
    server.use(
      http.post('http://localhost:3000/api/v1/auth/login', () => {
        return HttpResponse.json({
          success: true,
          data: {
            token: 'fake-jwt-token',
            user: { id: 1, username: 'admin', name: 'Admin', role: 'admin' },
          },
        });
      })
    );

    render(
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    );

    await userEvent.type(screen.getByPlaceholderText('手机号/邮箱'), 'admin');
    await userEvent.type(screen.getByPlaceholderText('请输入密码'), '123456');
    // Check terms
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should show error on login failure', async () => {
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'ERR_AUTH_INVALID',
              message: '用户名或密码错误',
            },
          },
          { status: 401 }
        );
      })
    );

    render(
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    );

    const user = userEvent.setup();

    // Fill form
    await user.type(screen.getByPlaceholderText('手机号/邮箱'), 'wrong');
    await user.type(screen.getByPlaceholderText('请输入密码'), 'wrong');
    // Check terms
    await user.click(screen.getByRole('checkbox'));

    // Submit
    const submitBtn = screen.getByRole('button', { name: /^登录$/ }); // Login button
    await user.click(submitBtn);

    // Verify error message (Toast message)
    expect(await screen.findByText(/用户名或密码错误/)).toBeInTheDocument();
  });
});
