import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CheckInButtonProps {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({ 
  onPress, 
  title = '打卡',
  disabled = false
}) => {
  return (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.disabled]} 
      onPress={onPress} 
      disabled={disabled}
      testID="check-in-button"
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1890ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
