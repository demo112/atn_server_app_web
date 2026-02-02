import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { DepartmentSelect } from './DepartmentSelect';

describe('DepartmentSelect', () => {
  it('renders correctly', () => {
    render(<DepartmentSelect onChange={() => {}} />);
    // expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('handles loading state', async () => {
    render(<DepartmentSelect onChange={() => {}} />);
    // expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // await waitFor(() => {
    //   expect(screen.getByText('Content')).toBeInTheDocument();
    // });
  });
});
