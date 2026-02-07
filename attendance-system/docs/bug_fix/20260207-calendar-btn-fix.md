# 考勤记录日历图标报错修复记录

## 问题描述
- **现象**：在考勤记录页面（HistoryScreen），点击右上角日历图标时报错。
- **复现步骤**：进入考勤记录页面 -> 点击右上角日历图标 -> 报错。
- **原因**：`HistoryScreen` 组件中使用了 `navigation.navigate` 但未定义 `navigation` 对象（缺少 `useNavigation` hook）。

## 设计锚定
- **所属规格**：考勤记录模块
- **原设计意图**：点击日历图标跳转到日历视图。
- **当前偏离**：代码中直接使用了未定义的 `navigation` 变量。

## 根因分析
- **直接原因**：`HistoryScreen.tsx` 中未调用 `useNavigation` 获取 `navigation` 实例。
- **根本原因**：代码编写疏忽，且缺乏对应的单元测试覆盖该交互路径。

## 修复方案
- **修复思路**：引入 `@react-navigation/native` 的 `useNavigation` hook。
- **改动文件**：
  - `packages/app/src/screens/attendance/HistoryScreen.tsx`: 添加 `useNavigation` 和 `testID`。

## 测试环境修复
为了验证修复并添加回归测试，修复了 `packages/app` 的单元测试环境问题：
1. **TurboModuleRegistry 报错**：在 `jest-init.js` 中 mock `__turboModuleProxy`，支持 `PlatformConstants`, `SourceCode`, `DeviceInfo`, `UIManager`, `KeyboardObserver`。
2. **NativeEventEmitter 报错**：在 `jest-patch-native-modules.js` 中 mock `KeyboardObserver` 和 `NativePlatformConstantsIOS`。
3. **Jest 配置**：添加 `__mocks__/NativePlatformConstantsIOS.js` 并在 `jest.config.js` 中映射（已在之前的步骤中完成）。

## 验证结果
- [x] 原问题已解决：代码中已添加 `useNavigation`。
- [x] 回归测试通过：`packages/app/src/screens/attendance/HistoryScreen.test.tsx` 中新增测试用例 `navigates to calendar view when calendar icon is pressed` 并运行通过。
- [x] 编译通过。

## 提交信息
fix(app): 修复考勤记录页日历跳转报错及完善测试环境

1. HistoryScreen: 修复 navigation 未定义问题，添加 useNavigation
2. Tests: 新增 HistoryScreen 跳转功能的回归测试
3. Infra: 修复 RN 0.73+ 单元测试环境 (TurboModules, NativeModules mocks)
