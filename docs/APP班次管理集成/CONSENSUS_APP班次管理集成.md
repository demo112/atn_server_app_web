# 项目共识文档 (CONSENSUS)

## 1. 需求描述与验收标准

### 需求描述
在 APP 的“常用功能”中添加“班次管理”功能。
UI 和逻辑仿照 `incoming/app/shift-master---班次设置` 下的参考实现。

### 验收标准
1.  **入口**：APP 首页“常用功能”区域包含“班次管理”图标，点击可进入班次列表页面。
2.  **班次列表**：
    *   显示班次名称和多个时间段信息。
    *   支持搜索班次。
    *   列表上方有“添加班次”按钮。
3.  **班次编辑/添加**：
    *   支持设置班次名称。
    *   支持添加多个时间段（最多3个）。
    *   每个时间段包含：上班时间、下班时间、必须签到开关、签到时间段、必须签退开关、签退时间段。
    *   支持保存和取消。
4.  **数据一致性**：更新数据模型以支持多时段班次结构。

## 2. 技术实现方案

### 架构调整
*   **数据模型**：更新 `packages/app/src/types/shift.ts`，将 `Shift` 接口扩展为包含 `timeSlots` 数组，与参考实现保持一致。
*   **路由**：确保 `ShiftList` 和 `ShiftEdit` 页面已正确注册在 React Navigation 中。

### 组件开发
*   **HomeScreen**：修改 `src/screens/HomeScreen.tsx`，添加菜单项。
*   **ShiftListScreen**：重构 `src/screens/shift/ShiftListScreen.tsx`，适配新 UI。
*   **ShiftEditScreen**：重构 `src/screens/shift/ShiftEditScreen.tsx`，实现多时段编辑逻辑。
*   **复用**：尽可能复用 RN Paper 组件 (`Switch`, `TextInput`, `Card` 等) 来替代 Web 端的 HTML 元素。

### 关键约束
*   使用 React Native Paper 进行 UI 开发。
*   确保与现有 APP 的主题和导航风格一致。
*   数据存储目前可能使用 Mock 数据或本地状态（参考现有代码中的 `INITIAL_SHIFTS`），暂不涉及后端 API 集成（除非现有代码已经集成）。

## 3. 风险与缓解
*   **复杂表单状态管理**：多时段编辑涉及复杂的嵌套状态，需小心处理。
*   **时间选择器**：RN 上的时间选择器体验与 Web 不同，需选择合适的库（如 `@react-native-community/datetimepicker` 或 RN Paper 的 TimePicker）。
*   **布局适配**：Web 的 Tailwind 样式需要转换为 RN 的 StyleSheet。

## 4. 确认事项
*   所有不确定性已通过代码分析解决。
*   技术栈确认为 React Native (Expo) + React Native Paper。
