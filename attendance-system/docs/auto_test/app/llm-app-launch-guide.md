# App 模拟器启动与调试指南 (LLM Context)

本文档旨在为 LLM 提供关于如何在 Android 模拟器中启动和调试 `@attendance/app` (React Native + Expo) 的完整上下文和操作指南。

## 1. 项目环境上下文

-   **项目路径**: `attendance-system/packages/app`
-   **技术栈**: React Native (0.81.5), Expo (54.0.33), React (19.1.0)
-   **包管理器**: pnpm (Monorepo 环境)

## 2. 启动前检查 (Pre-flight Check)

在执行启动命令前，LLM 应检查以下关键点以避免常见错误：

### 2.1 依赖版本一致性 (Critical)
React Native 对 `react` 和 `react-native-renderer` 的版本要求极为严格，必须完全匹配。
**常见错误**: `Error: Incompatible React versions: react: 19.0.0 vs react-native-renderer: 19.1.0`

**检查命令**:
```bash
npm list react react-native
```

**修复策略 (如果版本不匹配)**:
必须强制清理并重新安装，不能仅依靠 `pnpm install`。
```powershell
# 1. 在根目录执行清理 (PowerShell)
Remove-Item -Path "pnpm-lock.yaml", "node_modules", "packages\*\node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# 2. 重新安装
pnpm install
```

## 3. 启动流程 (Launch Process)

### 3.1 启动命令
使用 `npm run android` 启动 Metro Bundler 并尝试连接模拟器。

```bash
cd packages/app
npm run android
# 或者强制清除缓存启动 (推荐用于解决缓存导致的奇怪问题)
npx expo start --android --clear
```

### 3.2 交互式操作
如果 Metro Bundler 启动后没有自动打开模拟器，LLM 可能需要提示用户或尝试在运行中的终端输入指令（但在非交互式环境中不可行，需依赖 CLI 参数）。

-   `a`: 打开 Android 模拟器
-   `r`: 重新加载 (Reload)

## 4. 故障排查 (Troubleshooting)

### 4.1 "Incompatible React versions" 红屏报错
**现象**: 模拟器显示红屏，报错信息包含版本不匹配。
**原因**: `node_modules` 中存在旧版本的 React 依赖残留（常见于 React 19.0.0 vs 19.1.0）。
**解决方案**: 参照 "2.1 依赖版本一致性" 进行彻底清理和重装。

### 4.2 模拟器未连接
**现象**: `No Android devices found.`
**解决方案**: 确保 Android Studio 模拟器已运行，或使用 `adb devices` 检查连接状态。

## 5. 验证 (Verification)

启动成功的标志：
1.  Metro Bundler 终端显示 QR 码。
2.  模拟器屏幕显示应用首页（非红屏）。
3.  `adb logcat` 中无 fatal 异常。

```bash
# 检查 Logcat 确认 React Native 运行状态
adb logcat *:S ReactNative:V ReactNativeJS:V
```
