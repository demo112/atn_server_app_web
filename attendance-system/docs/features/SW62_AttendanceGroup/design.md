# 技术设计文档：考勤组管理 (SW62_AttendanceGroup)

## 1. 模块结构
目标路径: `packages/web/src/pages/attendance/group`

```
src/pages/attendance/group/
├── components/
│   ├── GroupList.tsx       # 列表视图 (原 AttendanceListView)
│   ├── GroupForm.tsx       # 表单视图 (原 AttendanceFormView)
│   ├── SelectionModals.tsx # 选择弹窗 (人员/设备/班次)
│   └── types.ts            # 类型定义 (迁移自 incoming)
├── GroupPage.tsx           # 主页面容器 (原 App.tsx 逻辑)
└── constants.ts            # Mock 数据
```

## 2. 路由设计
- 路径: `/attendance/groups`
- 组件: `GroupPage`
- 需要在 `src/App.tsx` 或路由配置中注册。

## 3. 组件迁移策略

### 3.1 GroupList.tsx
- 保持原有 JSX 结构
- 替换 icon 为 `material-icons` 或 `material-symbols-outlined`
- 保持 Tailwind 类名
- Props: `onAdd`, `onEdit`

### 3.2 GroupForm.tsx
- 保持原有 Section 结构
- 状态管理保持 `useState`
- 集成 `SelectionModals`

### 3.3 SelectionModals.tsx
- 实现简单的 Mock 弹窗，用于演示交互

## 4. 数据流
- 目前使用本地 Mock 数据 (`constants.ts`)
- `GroupPage` 管理 `currentView` (LIST | FORM) 和 `editingGroup` 状态

## 5. 依赖检查
- Tailwind CSS (v4) ✅
- Material Icons (CDN in index.html) ✅
- React Router (已安装) ✅
