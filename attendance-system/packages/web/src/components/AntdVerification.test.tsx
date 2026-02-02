import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from 'antd';
import React from 'react';

describe('Ant Design Verification', () => {
  it('renders antd button correctly', () => {
    render(<Button type="primary">Verify Button</Button>);
    expect(screen.getByText('Verify Button')).toBeInTheDocument();
  });
});
