const path = require('path');

module.exports = {
  preset: 'jest-expo',
  rootDir: path.resolve(__dirname, '../../'),
  roots: ['<rootDir>/packages/app'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['<rootDir>/packages/app/jest-setup.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
  testMatch: ['<rootDir>/packages/app/**/*.test.tsx', '<rootDir>/packages/app/**/*.test.ts'],
};
