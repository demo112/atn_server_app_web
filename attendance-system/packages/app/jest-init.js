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

// Mock TurboModuleRegistry proxy
global.__turboModuleProxy = (name) => {
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
    if (name === 'DeviceInfo') {
      return {
        getConstants: () => ({
          Dimensions: {
            window: { width: 375, height: 812, scale: 3, fontScale: 1 },
            screen: { width: 375, height: 812, scale: 3, fontScale: 1 },
          },
        }),
      };
    }
    if (name === 'UIManager') {
      return {
        getConstants: () => ({}),
        getViewManagerConfig: (name) => {
          return {};
        },
        measure: (node, callback) => callback(0, 0, 100, 100, 0, 0),
        measureInWindow: (node, callback) => callback(0, 0, 100, 100),
        measureLayout: (node, relativeTo, onFail, onSuccess) => onSuccess(0, 0, 100, 100),
        configureNextLayoutAnimation: (config, callback) => callback && callback(),
        setLayoutAnimationEnabledExperimental: () => {},
      };
    }
    if (name === 'KeyboardObserver') {
      return {
        addListener: () => {},
        removeListeners: () => {},
      };
    }
    return null;
  };

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
