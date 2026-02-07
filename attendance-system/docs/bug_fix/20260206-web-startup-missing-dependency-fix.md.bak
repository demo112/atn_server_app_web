# Web 启动失败修复记录

## 问题描述
- **现象**：启动环境时，Web 服务报错并退出。
- **复现步骤**：运行 `npm run dev:services` 或 `npm run dev -w @attendance/web`。
- **影响范围**：无法启动 Web 前端开发环境。
- **错误信息**：
  ```
  [vite] Pre-transform error: Failed to resolve import "date-fns" from "src/pages/attendance/leave/LeavePage.tsx". Does the file exist?
  ```

## 设计锚定
- **所属规格**：环境配置
- **原设计意图**：项目应能正常启动，所有依赖应在 `package.json` 中声明。
- **当前偏离**：`packages/web/src/pages/attendance/leave/LeavePage.tsx` 使用了 `date-fns`，但 `packages/web/package.json` 中缺少该依赖。

## 根因分析
- **直接原因**：缺少 `date-fns` 依赖。
- **根本原因**：代码引入了新库但未更新 `package.json`。
- **相关代码**：`packages/web/src/pages/attendance/leave/LeavePage.tsx`

## 修复方案
- **修复思路**：安装缺失的依赖。
- **改动文件**：`packages/web/package.json` (通过 `pnpm add` 修改)

## 验证结果
- [x] 原问题已解决：Web 服务成功启动在 5173 端口。
- [x] 回归测试通过：页面可访问（通过日志确认）。
- [x] 设计一致性确认：符合依赖管理规范。

## 提交信息
fix(web): 添加缺失的 date-fns 依赖

修复 Web 启动失败的问题。
