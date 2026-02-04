# Design: Web UI 标准化整改 (UI-STD-001)

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 统一弹窗风格 | 新建 `StandardModal` 组件，替换所有页面中的 Modal/Dialog |
| Story 2: 统一表格风格 | 按照 `ShiftTable` (Incoming) 样式重构所有表格，使用 Tailwind CSS + Material Icons |

## 视觉规范 (Visual Consistency)

为了确保“不只是组件风格统一，更重要的是视觉效果的一致性”，必须严格遵守以下规范：

### 1. 颜色系统 (Color System)
- **Primary**: `#4A90E2` (`bg-primary`, `text-primary`, `border-primary`)
- **Background**:
  - Page/Modal Body: `#FFFFFF` (`bg-white`)
  - Table Header/Row Hover: `#F9FAFB` (`bg-gray-50`)
  - Modal Overlay: `rgba(0, 0, 0, 0.5)` (`bg-black/50`)
- **Text**:
  - Primary Content: `#374151` (`text-gray-700`)
  - Secondary/Label: `#6B7280` (`text-gray-500`)
  - Inverse (on Primary): `#FFFFFF` (`text-white`)
- **Border**: `#D1D5DB` (`border-gray-300`)

### 2. 排版 (Typography)
- **Base Size**: `text-sm` (14px)
- **Table Header**: `text-xs` (12px), `uppercase`, `font-semibold`, `tracking-wider`
- **Modal Title**: `text-lg` (18px), `font-semibold`
- **Icon Size**: `text-lg` (18px) for actions, `text-sm` (14px) for inline icons

### 3. 组件样式 (Component Styles)

#### StandardModal
- **Header**: `bg-primary h-[56px] px-6 flex items-center justify-between`
- **Body**: `p-8` (Padding is large)
- **Footer**: `px-8 py-4 bg-gray-50 border-t border-gray-200`
- **Close Button**: `hover:bg-white/20 rounded-full p-1`

#### StandardTable
- **Header Row**: `bg-gray-50 border-b border-gray-200 h-[48px]`
- **Body Row**: `border-b border-gray-100 hover:bg-gray-50 h-[56px] transition-colors`
- **Action Buttons**: `p-1 rounded-md text-gray-400 hover:text-primary hover:bg-blue-50`

#### Buttons
- **Primary**: `bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium`
- **Secondary/Cancel**: `border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded text-sm font-medium`
- **Icon Button**: `border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded flex items-center`

## 组件设计

### 1. StandardModal (src/components/common/StandardModal.tsx)

```typescript
interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string; // default: 'max-w-4xl'
}
```

### 2. StandardTable (src/components/common/StandardTable.tsx) - *Optional Wrapper*
虽然主要通过样式统一，但提取一个 `StandardTable` 容器组件有助于统一边框和圆角。

## 文件变更清单

### 新增公共组件
| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/web/src/components/common/StandardModal.tsx` | 新增 | 通用弹窗组件 |

### 考勤模块 (Attendance)
| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/web/src/pages/attendance/clock/ClockRecordPage.tsx` | 修改 | 替换表格样式 |
| `packages/web/src/pages/attendance/correction/components/CheckInDialog.tsx` | 修改 | 使用 StandardModal |
| `packages/web/src/pages/attendance/correction/components/CheckOutDialog.tsx` | 修改 | 使用 StandardModal |
| `packages/web/src/pages/attendance/leave/components/LeaveDialog.tsx` | 修改 | 使用 StandardModal |
| `packages/web/src/pages/attendance/schedule/components/BatchScheduleDialog.tsx` | 修改 | 使用 StandardModal |
| `packages/web/src/pages/attendance/schedule/components/ScheduleDialog.tsx` | 修改 | 使用 StandardModal |
| `packages/web/src/pages/attendance/shift/components/ShiftModal.tsx` | 修改 | 使用 StandardModal |
| `packages/web/src/pages/attendance/shift/components/ShiftTable.tsx` | 修改 | 替换表格样式 |
| `packages/web/src/pages/attendance/time-period/components/TimePeriodDialog.tsx` | 修改 | 使用 StandardModal |

### 组织模块 (Org)
| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/web/src/pages/department/components/DepartmentForm.tsx` | 修改 | 使用 StandardModal |
| `packages/web/src/pages/employee/components/BindUserModal.tsx` | 修改 | 使用 StandardModal |
| `packages/web/src/pages/employee/components/EmployeeModal.tsx` | 修改 | 使用 StandardModal |
| `packages/web/src/pages/user/UserList.tsx` | 修改 | 替换表格样式 |

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 所有弹窗交互 | UI 样式改变，DOM 结构改变 | 中 |
| 表格展示 | 样式改变，可能影响列宽和布局 | 低 |
| Dark Mode | **将移除 Dark Mode 支持** (以符合标准) | 低 |
| Antd 依赖 | 逐步移除 Antd 组件的使用 | 中 |

## 技术决策

- **Icon System**: 统一使用 `Material Icons` (class based)，替换现有的 `Antd Icons`。
- **CSS Framework**: 统一使用 `Tailwind CSS`，移除行内样式和 Antd 样式覆盖。
- **Dark Mode**: 根据参考标准，不保留 Dark Mode 支持。
