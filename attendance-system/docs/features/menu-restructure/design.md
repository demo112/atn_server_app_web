# Design: 考勤系统菜单重构

## 1. 概述
根据需求重构 Web 端侧边栏菜单结构。

## 2. 模块设计

### 2.1 侧边栏 (Sidebar)
修改 `packages/web/src/components/layout/Sidebar.tsx` 中的 `menuItems` 配置。

#### 新的数据结构
```typescript
const menuItems: NavItem[] = [
  { id: 'user', label: '用户管理', path: '/users', icon: 'person' },
  { id: 'employee', label: '人员管理', path: '/employees', icon: 'badge' },
  {
    id: 'attendance-config',
    label: '考勤配置',
    path: '/attendance-config', // Virtual path for group
    icon: 'settings',
    subItems: [
      { id: 'setting', label: '考勤设置', path: '/attendance/settings' },
      { id: 'shift', label: '班次管理', path: '/attendance/shifts' },
      { id: 'schedule', label: '排班管理', path: '/attendance/schedule' },
    ]
  },
  {
    id: 'attendance-processing',
    label: '考勤处理', // Renamed from 考勤管理
    path: '/attendance-processing', // Virtual path
    icon: 'access_time',
    subItems: [
      { id: 'correction-processing', label: '补签处理', path: '/attendance/correction-processing' },
      { id: 'correction', label: '补签记录', path: '/attendance/correction' },
      { id: 'leave', label: '请假管理', path: '/attendance/leave' },
    ]
  },
  {
    id: 'attendance-statistics',
    label: '考勤统计', // Renamed from 统计报表
    path: '/statistics', // Virtual path (though /statistics route exists, sidebar will only expand)
    icon: 'bar_chart',
    subItems: [
      { id: 'dashboard', label: '统计报表', path: '/statistics/dashboard' }, // Renamed from 统计仪表盘
      { id: 'records', label: '打卡记录', path: '/attendance/daily-records' }, // Moved/Renamed from 每日考勤
    ]
  }
];

#### 交互设计
- 对于包含 `subItems` 的一级菜单项（如“考勤配置”、“考勤处理”、“考勤统计”）：
  - **点击行为**：仅切换子菜单的展开/折叠状态，**不进行路由跳转**。
  - **路径匹配**：如果当前 URL 匹配任意子菜单项的路径，该一级菜单应自动展开。
- 对于不含 `subItems` 的一级菜单项（如“用户管理”）：
  - **点击行为**：直接跳转到对应路由。
```

### 2.2 路由 (Routes)
- 保持 `packages/web/src/routes` 配置不变。
- 路径映射关系：
  - `/attendance/daily-records` 继续作为“打卡记录”页面。
  - `/statistics/dashboard` 继续作为“统计报表”页面。

## 3. 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/web/src/components/layout/Sidebar.tsx` | 修改 | 更新 `menuItems` 数组结构 |

## 4. 验证计划
- 运行 Web 项目。
- 检查侧边栏菜单结构。
- 点击每个菜单项验证跳转。
