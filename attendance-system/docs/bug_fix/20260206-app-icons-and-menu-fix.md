# App 图标修复与菜单调整

## 问题描述
1. App 首页图标不显示（显示为蓝色圆圈）。
2. 需要移除首页“排班管理”入口。

## 原因分析
1. **图标缺失**：项目未安装 `@expo/vector-icons` 依赖，且 `PaperProvider` 未配置图标组件。
2. **菜单调整**：需求变更。

## 修复方案
1. 安装 `@expo/vector-icons`。
2. 在 `App.tsx` 中配置 `PaperProvider` 使用 `MaterialCommunityIcons`。
3. 修改 `HomeScreen.tsx`，移除“排班管理”菜单项。

## 验证结果
- 类型检查通过 (`npm run type-check`)。
- 代码修改符合预期。
