const path = require('path');
const jestExpoPreset = require('jest-expo/jest-preset');

const config = {
  ...jestExpoPreset,
  rootDir: __dirname,
  roots: ['<rootDir>'],
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|@attendance))',
  ],
  setupFiles: [
    '<rootDir>/jest-init.js',
    jestExpoPreset.setupFiles[0], // react-native/jest/setup.js
    '<rootDir>/jest-patch-native-modules.js',
    '<rootDir>/jest-expo-setup-patched.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  moduleDirectories: ['node_modules', path.resolve(__dirname, '../../node_modules')],
  testMatch: ['**/*.test.tsx', '**/*.test.ts'],
};

module.exports = config;
