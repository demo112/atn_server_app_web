# App 白屏问题 (ERR_ABORTED) 修复记录

## 问题描述
- **现象**：App 启动后白屏，浏览器控制台报错 `net::ERR_ABORTED http://localhost:8083/src%5Cindex.ts.bundle...`。
- **复现步骤**：
  1. 运行 `pnpm --filter @attendance/app start`
  2. 访问 `http://localhost:8083` (或 8081)
- **影响范围**：App 无法启动预览。

## 根因分析
- **直接原因**：Windows 环境下，Expo Metro Bundler 在解析 `src/index.ts` 作为入口时，生成了带有反斜杠的 URL (`src%5Cindex.ts`)，导致浏览器请求失败。
- **根本原因**：Metro/Expo CLI 在 Windows Monorepo 环境下的路径规范化 bug。
- **相关代码**：`packages/app/package.json`, `packages/app/app.json`

## 修复方案
- **修复思路**：将入口文件移至包根目录 (`packages/app/index.ts`)，避免路径中包含目录分隔符，从而规避 Windows 路径解析问题。
- **改动文件**：
  1. `packages/app/index.ts`: 新建文件，导入 `./src/index`。
  2. `packages/app/app.json`: 修改 `"entryPoint": "./index.ts"`。
  3. `packages/app/package.json`: 修改 `"main": "./index.ts"`。

## 验证结果
- [x] 原问题已解决：App 可正常加载，无 ERR_ABORTED 错误。
- [x] 回归测试通过：Backend 连接正常 (Port 3001)。
- [x] 编译通过。

## 提交信息
fix(app): 将入口移至根目录以修复Windows下路径分隔符问题
