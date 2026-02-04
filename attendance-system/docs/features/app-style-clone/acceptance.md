# 验收记录：App样式复刻

## 变更内容

### 1. 基础设施
- 创建 `packages/app/src/theme.ts`，定义了与 Web 端 Tailwind 配置一致的主题颜色。
- 修改 `packages/app/src/App.tsx`，引入 `PaperProvider` 并注入自定义 Theme。

### 2. 员工端页面 (核心高频)
| 页面 | 变更点 |
|------|-------|
| **登录页** (Login) | 使用 Card 布局，圆角输入框，主色调按钮，复刻 Web 风格 |
| **首页** (Home) | Grid 卡片布局，使用 Avatar.Icon，顶部主色调 Header |
| **打卡页** (ClockIn) | 顶部时间大字展示，打卡按钮使用 Paper Button，记录列表使用 Card |
| **请假页** (Leave) | 使用 Card 展示申请记录，FAB 悬浮按钮添加申请，Modal 表单样式优化 |
| **补卡页** (Correction) | 使用 Card 展示补卡记录，FAB 悬浮按钮添加，Radio Button 选择类型 |
| **记录页** (History) | 顶部月份切换栏，Card 展示每日记录，Status Chip 颜色区分 |
| **排班页** (Schedule) | Card 展示每日排班，区分工作日/休息日样式 |

### 3. 管理端页面 (列表页)
| 页面 | 变更点 |
|------|-------|
| **部门管理** | 使用 Card 展示部门，FAB 添加按钮 |
| **人员管理** | Searchbar 搜索栏，Card 展示人员信息(带头像)，FAB 添加按钮 |
| **用户管理** | Searchbar 搜索栏，Card 展示用户信息(带角色Tag)，FAB 添加按钮 |
| **排班管理** | Searchbar 搜索栏，Card 展示班次信息，FAB 添加按钮 |

## 验证结果

- [x] 代码编译通过 (TypeScript Check)
- [x] 依赖检查通过 (react-native-paper 已安装)
- [x] 样式代码逻辑正确 (StyleSheet + Theme)
- [x] 所有页面均移除原生丑陋组件，替换为 Paper 组件
- [x] 全局主题色 (#4A90E2) 统一应用

## 遗留项 (Low Priority)
- 编辑页 (EditScreen) 的表单样式暂未深度复刻，但已能正常使用。
- 部分复杂图表 (Charts) 暂未移植。
