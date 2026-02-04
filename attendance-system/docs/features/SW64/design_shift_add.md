# Design: App 班次添加页面仿制

## 组件设计

### 1. Toggle 组件
- **文件**: `src/components/common/Toggle.tsx`
- **Props**: `{ checked: boolean, onChange: (val: boolean) => void }`
- **实现**: 使用 `Pressable` 和 `LayoutAnimation` 或 `Animated` 实现开关动画。

### 2. SegmentCard 组件
- **文件**: `src/components/shift/SegmentCard.tsx`
- **Props**: `{ segment: TimeSegment, index: number, onUpdate: (s: TimeSegment) => void }`
- **UI结构**:
  - Header: 第N次
  - Section 1: 上班时间 (Row)
  - Section 2: 签到限制 (Container) -> Toggle + Range Picker
  - Section 3: 下班时间 (Row)
  - Section 4: 签退限制 (Container) -> Toggle + Range Picker

### 3. ShiftEditScreen 页面
- **文件**: `src/screens/shift/ShiftEditScreen.tsx`
- **状态**: `shift: ShiftSettings`
- **布局**:
  - Header: Back Button + Title
  - ScrollView:
    - Name Input Card
    - Segments List (Map)
    - Add Segment Button (if < 3)
    - Absence Settings Card
  - Footer: Save Button

## 数据模型 (Types)

保持 `src/types/shift.ts` 与 `incoming/app/shift_add/types.ts` 一致：
```typescript
interface TimeSegment {
  id: string;
  startTime: string;
  endTime: string;
  mustSignIn: boolean;  // 新增/确认
  signInRange: string;
  mustSignOut: boolean; // 新增/确认
  signOutRange: string;
}
```

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/common/Toggle.tsx` | 新增 | 通用开关组件 |
| `src/components/shift/SegmentCard.tsx` | 修改 | 适配 incoming 设计 |
| `src/screens/shift/ShiftEditScreen.tsx` | 修改 | 适配 incoming 布局 |
| `src/types/shift.ts` | 修改 | 确保字段完整 |
