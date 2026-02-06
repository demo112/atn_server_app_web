import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Header from './Header';
import { AuthProvider } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import * as authUtils from '../../utils/auth';

// Mock auth utils
vi.mock('../../utils/auth', async () => {
  const actual = await vi.importActual('../../utils/auth');
  return {
    ...actual,
    getUser: vi.fn(),
    getToken: vi.fn(),
    clearAuth: vi.fn(),
  };
});

// Mock ToastProvider
vi.mock('../../components/common/ToastProvider', () => ({
  useToast: () => ({ toast: { success: vi.fn(), error: vi.fn() } }),
  ToastProvider: ({ children }: any) => <div>{children}</div>,
}));

describe('Header Component', () => {
  let originalLocation: Location;

  beforeEach(() => {
    vi.clearAllMocks();
    originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  afterEach(() => {
    window.location = originalLocation as any;
  });

  it('should render user info and logout button when logged in', () => {
    // Mock logged in user
    vi.mocked(authUtils.getUser).mockReturnValue({
      id: 1,
      username: 'testuser',
      role: 'admin',
      name: 'Test User',
    });
    vi.mocked(authUtils.getToken).mockReturnValue('fake-token');

    render(
      <AuthProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </AuthProvider>
    );

    // Check username display
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('管理员')).toBeInTheDocument();

    // Check logout button
    expect(screen.getByText('退出')).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', () => {
     // Mock logged in user
     vi.mocked(authUtils.getUser).mockReturnValue({
        id: 1,
        username: 'testuser',
        role: 'admin',
        name: 'Test User',
      });
      vi.mocked(authUtils.getToken).mockReturnValue('fake-token');

      render(
        <AuthProvider>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </AuthProvider>
      );

      const logoutBtn = screen.getByRole('button', { name: /退出/i });
      fireEvent.click(logoutBtn);

      // Check if clearAuth was called (from AuthContext logout)
      expect(authUtils.clearAuth).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
  });
});
