# Design: UA3 部门管理

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 部门维护 | API: POST/PUT/DELETE /departments, 组件: DepartmentForm |
| Story 2: 部门树展示与排序 | API: GET /departments/tree, 组件: DepartmentTree (AntD Tree) |
| Story 3: 部门选择 | 组件: DepartmentSelect (封装 TreeSelect) |

## 数据模型

现有模型 `Department` 已满足需求：

```prisma
model Department {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(100)
  parentId  Int?     @map("parent_id")
  sortOrder Int      @default(0) @map("sort_order")
  // ...
  parent    Department?  @relation("DeptTree", fields: [parentId], references: [id])
  children  Department[] @relation("DeptTree")
  employees Employee[]
}
```

## API 定义

### 1. 获取部门树

**GET /api/v1/departments/tree**

获取全量部门树结构。

**Response:**
```typescript
interface DepartmentVO {
  id: number
  name: string
  parentId: number | null
  sortOrder: number
  children?: DepartmentVO[]
}

type GetDepartmentTreeResponse = ApiResponse<DepartmentVO[]>
```

### 2. 创建部门

**POST /api/v1/departments**

**Request:**
```typescript
interface CreateDepartmentDto {
  name: string
  parentId?: number // 不传则为根节点
}
```

### 3. 更新部门

**PUT /api/v1/departments/:id**

支持改名、移动（修改 parentId）、排序（修改 sortOrder）。

**Request:**
```typescript
interface UpdateDepartmentDto {
  name?: string
  parentId?: number
  sortOrder?: number
}
```

**逻辑:**
- 若修改 `parentId`，需校验：
  - 新 parent 不能是自己
  - 新 parent 不能是自己的子孙节点（循环引用）
- 若只修改 `sortOrder`，用于同级排序。

### 4. 删除部门

**DELETE /api/v1/departments/:id**

**逻辑:**
- 校验：若有子部门，报错 `ERR_DEPT_HAS_CHILDREN`
- 校验：若有关联员工，报错 `ERR_DEPT_HAS_EMPLOYEES`

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/shared/src/types/department.ts` | 新增 | DepartmentDto, DepartmentVO 类型定义 |
| `packages/server/src/modules/department/department.service.ts` | 新增 | 树构建、CRUD、移动校验逻辑 |
| `packages/server/src/modules/department/department.controller.ts` | 新增 | API 接口实现 |
| `packages/web/src/pages/department/DepartmentPage.tsx` | 新增 | 部门管理主页面（左树右表单或弹窗） |
| packages/web/src/pages/department/components/DepartmentTree.tsx | 新增 | 树形展示组件 |
| `packages/web/src/pages/department/components/DepartmentForm.tsx` | 新增 | 新增/编辑表单 |

## 关键技术决策

1.  **树的构建**: 数据库存储邻接表 (`parentId`)，Server 端一次性查出所有部门，在内存中组装成树返回给前端。考虑到部门数量通常不多（<1000），性能可控。

## 影响分析

-   **人员管理 (UA2)**: 需要使用部门选择组件。UA2 开发时需引用本模块的 `DepartmentSelect`。
-   **公共类型**: 需在 `packages/shared` 中添加定义，注意不要破坏现有结构。

## 风险点

-   **并发修改**: 多人同时操作部门树可能导致 `sortOrder` 冲突。鉴于管理操作低频，暂不加锁，接受最后提交覆盖。
-   **循环引用**: 必须严格校验，防止树变成图。

## 需要人决策

- [x] 是否需要支持批量导入部门？ -> Out of Scope
- [x] 删除部门时是否支持级联删除（连同子部门）？ -> 否，必须先清空子节点。
