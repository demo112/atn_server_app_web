# Design: 班次管理 (SW64)

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 查看班次列表 | `ShiftListScreen` (FlatList) |
| Story 2: 搜索班次 | `ShiftListScreen` (Local Filter) |
| Story 3: 添加班次 | `AddShiftModal` (React Native Modal) |

## 数据模型

数据暂时仅在前端状态中维护（模拟 `incoming` 的行为）。

```typescript
// packages/app/src/types/shift.ts

export interface Shift {
  id: string;
  name: string;
  startTime: string; // Format: "HH:mm"
  endTime: string;   // Format: "HH:mm"
}
```

## UI 组件设计

### 1. ShiftListScreen (`packages/app/src/screens/shift/ShiftListScreen.tsx`)

- **功能**: 展示班次列表，提供搜索和添加入口。
- **状态**:
  - `shifts`: `Shift[]` (初始包含默认数据)
  - `searchTerm`: `string`
  - `isModalVisible`: `boolean` (控制 Modal 显示)
- **UI**:
  - 头部搜索框
  - 列表区域 (`FlatList`)
  - 底部/悬浮添加按钮 (或顶部按钮，参考 `incoming` 是列表上方的大按钮)

### 2. AddShiftModal (`packages/app/src/components/shift/AddShiftModal.tsx`)

- **功能**: 添加班次表单。
- **Props**:
  - `visible`: `boolean`
  - `onClose`: `() => void`
  - `onAdd`: `(shift: Omit<Shift, 'id'>) => void`
- **UI**:
  - Modal 容器 (半透明背景 + 底部弹出内容)
  - 输入框: 名称, 开始时间, 结束时间
  - 按钮: "取消", "保存"

## API / AI 集成

*AI 智能建议功能已移除。*

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/app/src/types/shift.ts` | 修改 | 确保包含 `Shift` 接口 |
| `packages/app/src/screens/shift/ShiftListScreen.tsx` | 修改 | 集成 `AddShiftModal`，更新 UI 匹配仿制目标 |
| `packages/app/src/components/shift/AddShiftModal.tsx` | 新增 | 仿制 `incoming` 的 Modal 组件 |

## 技术决策

1.  **Modal 实现**: 使用 React Native 原生 `Modal` 组件，配合 `transparent={true}` 实现半透明遮罩效果，模拟 Web 端的 Dialog 体验。
2.  **样式**: 使用 `StyleSheet` 或 `nativewind` (如果项目已配置)。考虑到现有代码使用 `StyleSheet`，保持一致性优先，或者如果项目有 Tailwind 配置则使用 Tailwind。
3.  **时间选择**: `incoming` 使用的是文本输入 (Default values '09:00')。App 端可以先用 `TextInput` 保持一致，或者升级为 `@react-native-community/datetimepicker`。为了“仿制”，先保持 `TextInput` 但限制格式，或提供简单的选择器。为了体验，建议使用 `DateTimePicker` 但为了快速仿制先用 Input。
    *   *决策*: 使用 `TextInput` 配合默认值，简化实现。

## 风险点

- 无重大技术风险。

## 需要人决策

- 无。遵循仿制原则。
