const NativeModulesPkg = require('react-native/Libraries/BatchedBridge/NativeModules');
const NativeModules = NativeModulesPkg.default || NativeModulesPkg;

console.log('Patching NativeModules check...');

if (NativeModules) {
  if (!NativeModules.UIManager) {
    console.log('NativeModules.UIManager is missing, patching it.');
    NativeModules.UIManager = {
      RCTView: {
        NativeProps: {},
        directEventTypes: {},
      },
    };
  } else {
    console.log('NativeModules.UIManager exists. Type:', typeof NativeModules.UIManager);
  }

  try {
      Object.defineProperty(NativeModules.UIManager, 'TestProp', { value: 1 });
      console.log('Successfully defined property on UIManager');
  } catch (e) {
      console.error('Failed to define property on UIManager:', e);
}

// Mock SourceCode for TurboModuleRegistry check in Expo
if (!NativeModules.SourceCode) {
  NativeModules.SourceCode = {
    getConstants: () => ({
      scriptURL: 'http://localhost:8081/index.bundle',
    }),
  };
}

// Mock PlatformConstants for TurboModuleRegistry check (React Native 0.73+)
if (!NativeModules.PlatformConstants) {
  NativeModules.PlatformConstants = {
    getConstants: () => ({
      isTesting: true,
      reactNativeVersion: { major: 0, minor: 73, patch: 0 },
      osVersion: '14.0',
      systemName: 'iOS',
      interfaceIdiom: 'phone',
    }),
  };
}

if (!NativeModules.NativePlatformConstantsIOS) {
  NativeModules.NativePlatformConstantsIOS = {
    getConstants: () => ({
      isTesting: true,
      reactNativeVersion: { major: 0, minor: 73, patch: 0 },
      osVersion: '14.0',
      systemName: 'iOS',
      interfaceIdiom: 'phone',
    }),
  };
}

if (!NativeModules.KeyboardObserver) {
  NativeModules.KeyboardObserver = {
    addListener: () => {},
    removeListeners: () => {},
  };
}

  
} else {
  console.error('NativeModules could not be required.');
}
