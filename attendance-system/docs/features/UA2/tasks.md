# Tasks: UA2 人员与部门管理

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 8 |
| 涉及模块 | Employee, Department, User |
| 涉及端 | Server, Web |
| 预计总时间 | 150 分钟 |

## 任务清单

### 阶段1：数据层与类型定义 (已完成)

#### Task 1: 数据库模型与共享类型
| 属性 | 值 |
|------|-----|
| 状态 | ✅ 已完成 |

### 阶段2：服务端实现 (已完成)

#### Task 2: Employee DTO 与 Service 实现
| 属性 | 值 |
|------|-----|
| 状态 | ✅ 已完成 |

#### Task 3: Employee Controller 与路由注册
| 属性 | 值 |
|------|-----|
| 状态 | ✅ 已完成 |

### 阶段3：Web端实现 (部分更新)

#### Task 4: 前端 Service 封装
| 属性 | 值 |
|------|-----|
| 状态 | ✅ 已完成 |

#### Task 5: 员工列表与删除功能
| 属性 | 值 |
|------|-----|
| 状态 | ✅ 已完成 |

#### Task 6: 员工编辑/新增弹窗
| 属性 | 值 |
|------|-----|
| 状态 | ✅ 已完成 |

#### Task 7: 部门管理 UI 集成 (新增)
| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx`<br>`packages/web/src/pages/employee/components_new/DepartmentModal.tsx` |
| 操作 | 修改/新增 |
| 内容 | 1. 增强 DepartmentSidebar，支持右键菜单或按钮<br>2. 实现部门 CRUD 操作调用<br>3. 移除独立的 DepartmentPage |
| 验证 | 可以在人员管理页面左侧直接增删改部门 |
| 状态 | ✅ 已完成 |

### 阶段4：集成验收

#### Task 8: 集成测试与文档同步
| 属性 | 值 |
|------|-----|
| 文件 | `docs/features/UA2/tasks.md`<br>`docs/features/UA2/design.md` |
| 操作 | 更新 |
| 内容 | 1. 验证完整业务流程 (含部门操作)<br>2. 确认删除后的数据表现<br>3. 同步文档状态 |
| 验证 | 业务流程通畅，无报错 |
| 状态 | ✅ 已完成 |
