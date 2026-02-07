// Mock BatchedBridge config BEFORE anything else runs
global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [],
  localModulesConfig: [],
};

// Mock NativeSourceCode to prevent TurboModuleRegistry error
jest.mock('react-native/Libraries/NativeModules/specs/NativeSourceCode', () => ({
  default: {
    getConstants: () => ({
      scriptURL: 'http://localhost:8081/index.bundle',
    }),
  },
}), { virtual: true });

// Mock TurboModuleRegistry to avoid Invariant Violation
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const actual = jest.requireActual('react-native/Libraries/TurboModule/TurboModuleRegistry');
  return {
    ...actual,
    getEnforcing: (name) => {
      if (name === 'PlatformConstants') {
        return {
          getConstants: () => ({
            isTesting: true,
            reactNativeVersion: { major: 0, minor: 73, patch: 0 },
            osVersion: '14.0',
            systemName: 'iOS',
            interfaceIdiom: 'phone',
          }),
        };
      }
      if (name === 'SourceCode') {
        return {
          getConstants: () => ({
            scriptURL: 'http://localhost:8081/index.bundle',
          }),
        };
      }
      return actual.getEnforcing(name);
    },
  };
}, { virtual: true });

// Mock Platform to avoid NativePlatformConstantsIOS error
jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const Platform = {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
    isTesting: true,
    Version: '14.0',
    constants: {
      reactNativeVersion: { major: 0, minor: 73, patch: 0 },
      osVersion: '14.0',
      systemName: 'iOS',
    },
  };
  return Platform;
}, { virtual: true });
