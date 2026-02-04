import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4A90E2', // Web: primary
    background: '#F3F4F6', // Web: background.light
    surface: '#ffffff', // Web: card.light
    surfaceVariant: '#ffffff', // Card background
    onSurface: '#111827', // Web: text
    secondaryContainer: '#E3F2FD', // Lighter primary for active states
    onSecondaryContainer: '#1976D2',
    outline: '#e5e7eb', // Web: border.light
  },
  roundness: 2, // 对应 8px (Default is 4 -> 16px? No, MD3 default is usually higher, but let's stick to small radius)
  // MD3 roundness: 0=0px, 1=4px, 2=8px, etc.
};
