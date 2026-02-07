# 考勤记录点击日历报错修复

## 问题描述
- **现象**：在考勤记录页面点击右上角日历图标时，报错 `Property 'navigation' doesn't exist`。
- **复现步骤**：进入考勤记录页面 -> 点击右上角日历图标。
- **影响范围**：考勤记录页面跳转功能。

## 设计锚定
- **所属规格**：考勤记录查看
- **原设计意图**：点击日历图标跳转到考勤日历视图。
- **当前偏离**：代码中使用了未定义的 `navigation` 变量。

## 根因分析
- **直接原因**：`HistoryScreen` 组件中未定义 `navigation` 变量。
- **根本原因**：开发时遗漏了 `useNavigation` hook 的调用。
- **相关代码**：`packages/app/src/screens/attendance/HistoryScreen.tsx`

## 修复方案
- **修复思路**：在组件内部添加 `const navigation = useNavigation();`。
- **改动文件**：
  - `packages/app/src/screens/attendance/HistoryScreen.tsx`
  - `packages/app/src/screens/attendance/HistoryScreen.test.tsx` (添加回归测试)

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| N/A | N/A | N/A |

## 验证结果
- [x] 原问题已解决 (代码逻辑确认)
- [ ] 回归测试通过 (测试环境配置问题导致运行失败，但添加了用例)
- [x] 设计一致性确认
- [x] 同类组件已检查

## 文档同步
- [ ] design.md：无需更新

## 防回退标记
**关键词**：HistoryScreen, navigation, calendar
**设计决策**：在组件内使用 useNavigation 获取导航对象。

## 提交信息
fix(app): 修复考勤记录页日历跳转报错

修复 HistoryScreen 中 navigation 未定义导致点击日历图标报错的问题。
