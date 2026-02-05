# 任务清单：用户登录信息展示与登出

## Task 1: 验证与完善 Header 组件
- **文件**: `packages/web/src/components/layout/Header.tsx`
- **内容**: 
  - 检查现有的用户信息展示逻辑是否符合需求（优先显示 name）
  - 检查登出按钮交互
  - 确保样式美观
- **验证**: `npm test packages/web/src/components/layout/Header.test.tsx`

## Task 2: 集成验证
- **内容**: 确保 `MainLayout` 正确引用 `Header` 且 `AuthGuard` 正常工作
- **验证**: 运行集成测试或手动验证
