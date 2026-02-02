import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CheckInButton } from './CheckInButton';

describe('CheckInButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(<CheckInButton onPress={() => {}} />);
    expect(getByText('打卡')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<CheckInButton onPress={onPressMock} />);
    
    fireEvent.press(getByTestId('check-in-button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<CheckInButton onPress={onPressMock} disabled />);
    
    fireEvent.press(getByTestId('check-in-button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
