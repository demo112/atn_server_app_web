// import '@testing-library/react-native/extend-expect';

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock BatchedBridge to avoid "Invariant Violation: __fbBatchedBridgeConfig is not set"
// This is required because we are transforming react-native code which triggers NativeModules checks
// @ts-ignore
global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [],
  localModulesConfig: [],
};

import 'react-native-gesture-handler/jestSetup';
