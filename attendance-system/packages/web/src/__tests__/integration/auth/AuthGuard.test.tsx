import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { AuthGuard } from '../../../components/AuthGuard';
import * as authUtils from '../../../utils/auth';
import { renderWithProviders } from '../../../test/utils';

// Mock react-router-dom Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: vi.fn(({ to }) => <div>Redirected to {to}</div>),
  };
});

// Mock auth utils
vi.mock('../../../utils/auth', async () => {
  const actual = await vi.importActual('../../../utils/auth');
  return {
    ...actual,
    getToken: vi.fn(),
    getUser: vi.fn(),
  };
});

describe('AuthGuard', () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when authenticated', () => {
    // Mock authenticated state
    vi.mocked(authUtils.getToken).mockReturnValue('valid-token');
    vi.mocked(authUtils.getUser).mockReturnValue({ id: '1', username: 'test', name: 'Test User', role: 'user' } as any);

    renderWithProviders(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    // Mock unauthenticated state
    vi.mocked(authUtils.getToken).mockReturnValue(null);
    vi.mocked(authUtils.getUser).mockReturnValue(null);

    renderWithProviders(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    // Should redirect to login (and thus not show protected content)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    
    // Check redirection
    expect(screen.getByText('Redirected to /login')).toBeInTheDocument();
  });
});
