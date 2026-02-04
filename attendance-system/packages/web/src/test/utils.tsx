import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/common/ToastProvider';
import { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';

// Custom render function that wraps components with necessary providers
const renderWithProviders = (
  ui: ReactElement,
  { route = '/', ...options }: RenderOptions & { route?: string } = {}
) => {
  window.history.pushState({}, 'Test page', route);

  return {
    user: userEvent.setup(),
    ...render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            {ui}
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
      options
    ),
  };
};

// Re-export everything from RTL
export * from '@testing-library/react';

// Override render method
export { renderWithProviders, renderWithProviders as render };
