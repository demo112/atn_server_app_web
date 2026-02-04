# Server 端测试覆盖分析与需求文档

## 一、分析概要

- **分析范围**：`packages/server/src` 核心模块 (Attendance, Auth, Department, User, Employee)
- **分析方法**：基于六大测试设计方法论（等价类、边界值、状态转换、决策表、场景法、错误推测）
- **目标**：识别测试盲区，提出补充用例，提升系统健壮性。

---

## 二、模块详细分析

### 2.1 Attendance 模块 (`src/modules/attendance`)

#### 2.1.1 `AttendanceClockService` (打卡服务)

**现有测试覆盖：**
- ✅ **PBT**：有效输入、不存在员工、未来时间。
- ✅ **单元测试**：1分钟内重复打卡限制。

**发现盲区：**

| 方法论 | 盲区描述 | 风险等级 | 建议补充 |
|--------|----------|----------|----------|
| **错误推测** | **并发防重复提交**：毫秒级并发请求可能绕过 `findFirst` 检查，导致重复打卡记录。 | 🔴 高 | 模拟并发请求测试，验证数据库唯一约束或锁机制。 |
| **等价类** | **无效日期格式**：`clockTime` 传入非日期字符串的处理。 | 🟡 中 | 传入非法日期字符串，验证 Service/DTO 层校验。 |
| **边界值** | **临界时间查询**：`startTime` = `endTime` 时的查询结果行为。 | 🟢 低 | 测试时间范围为单点时的查询结果。 |

**补充用例建议：**

```typescript
it('should prevent duplicate clocks under high concurrency', async () => {
  const data = { ...validClockData };
  const results = await Promise.all([
    service.create(data),
    service.create(data),
    service.create(data)
  ]);
  const successes = results.filter(r => r).length; // 预期仅1个成功
  expect(successes).toBe(1);
});
```

### 2.2 Auth 模块 (`src/modules/auth`)

#### 2.2.1 `AuthService` (认证服务)

**现有测试覆盖：**
- ✅ **单元测试**：正常登录、用户不存在、密码错误、未激活。

**发现盲区：**

| 方法论 | 盲区描述 | 风险等级 | 建议补充 |
|--------|----------|----------|----------|
| **安全测试** | **用户名枚举风险**：未激活用户返回特定错误信息 `Account is inactive`，攻击者可据此判断用户名存在。 | 🔴 高 | 统一返回 "Invalid credentials" 模糊错误。 |
| **等价类** | **空值防御**：Service 层对空 `username`/`password` 的直接调用防御（绕过 DTO）。 | 🟢 低 | 直接调用 Service 传入空串。 |

**补充用例建议：**

```typescript
it('should return generic error message for inactive user to prevent enumeration', async () => {
  mockPrisma.user.findUnique.mockResolvedValue({ status: 'inactive' } as any);
  await expect(service.login(data)).rejects.toThrow('Invalid credentials'); 
});
```

### 2.3 Department 模块 (`src/modules/department`)

#### 2.3.1 `DepartmentService` (部门服务)

**现有测试覆盖：**
- ✅ **单元测试**：树结构获取（部分）、创建/更新/删除基本逻辑。

**发现盲区：**

| 方法论 | 盲区描述 | 风险等级 | 建议补充 |
|--------|----------|----------|----------|
| **边界值** | **断层节点处理**：`getTree` 逻辑中，如果节点 `parentId` 存在但找不到父节点对象，会被提升为根节点。需验证这是否符合预期（还是应该报警/忽略）。 | 🟡 中 | 构造断层数据（parentId 指向不存在 ID），验证树构建结果。 |
| **错误推测** | **并发循环引用**：两个请求同时修改 A->B 和 B->A，可能绕过 `checkCircularReference` 检查。 | 🟡 中 | (较难模拟) 需依赖数据库事务隔离级别或乐观锁字段。 |
| **边界值** | **层级深度限制**：`checkCircularReference` 硬编码了 `MAX_DEPTH=20`，超过此深度的合法树会被误判或无法检测环。 | 🟢 低 | 构造深度 21 的树进行测试。 |

**补充用例建议：**

```typescript
it('should handle orphaned nodes gracefully in getTree', async () => {
  // Mock 数据：节点 A 指向不存在的 Parent B
  mockPrisma.department.findMany.mockResolvedValue([
    { id: 1, name: 'Orphan', parentId: 999 } 
  ]);
  const tree = await service.getTree();
  // 确认是被提升为 Root 还是被丢弃
  expect(tree).toHaveLength(1); 
  expect(tree[0].id).toBe(1);
});
```

### 2.4 User 模块 (`src/modules/user`)

#### 2.4.1 `UserService` (用户服务)

**现有测试覆盖：**
- ✅ **PBT**：CRUD 基本流程。

**发现盲区：**

| 方法论 | 盲区描述 | 风险等级 | 建议补充 |
|--------|----------|----------|----------|
| **安全测试** | **默认密码风险**：创建用户未指定密码时默认为 `123456`，且无强制修改标记。 | 🔴 高 | 验证默认密码策略，建议强制要求密码或标记 `mustChangePassword`。 |
| **边界值** | **关联唯一性冲突**：`employeeId` 为 `@unique`，并发绑定同一员工或绑定已被绑定的员工时的错误处理。 | 🟡 中 | 尝试将两个用户绑定到同一 `employeeId`。 |
| **功能缺失** | **关联搜索失效**：代码中注释掉了按员工姓名搜索的逻辑 `// { employee: ... }`。 | 🟡 中 | 测试 `keyword` 搜索员工姓名，验证是否支持。 |

**补充用例建议：**

```typescript
it('should fail when binding an employee already bound to another user', async () => {
  // 模拟数据库唯一约束冲突
  mockPrisma.user.create.mockRejectedValue(new Error('Unique constraint failed on the fields: (`employee_id`)'));
  await expect(service.create(dtoWithDuplicateEmployeeId)).rejects.toThrow();
});
```

### 2.5 Employee 模块 (`src/modules/employee`)

#### 2.5.1 `EmployeeService` (员工服务)

**发现盲区：**

| 方法论 | 盲区描述 | 风险等级 | 建议补充 |
|--------|----------|----------|----------|
| **状态转换** | **软删除事务一致性**：软删除涉及修改 `employeeNo`、`status` 和解绑 `User`。需验证其中一步失败是否整体回滚。 | 🔴 高 | Mock 事务中某一步骤抛出异常，验证数据库状态未改变。 |
| **边界值** | **工号唯一性释放**：软删除后，旧工号应被释放，允许新员工使用原工号注册。 | 🟡 中 | 1. 创建员工 A (工号 1001) -> 2. 删除 A -> 3. 创建员工 B (工号 1001) -> 4. 成功。 |

**补充用例建议：**

```typescript
it('should allow reusing employeeNo after soft delete', async () => {
  // 1. Delete employee with No 'E001'
  await service.delete(empId1);
  // 2. Create new employee with 'E001'
  const newEmp = await service.create({ ...dto, employeeNo: 'E001' });
  expect(newEmp).toBeDefined();
});
```

---

## 三、通用建议与行动计划

1.  **数据库异常模拟**：
    -   目前测试多为 "Happy Path"，缺乏数据库连接失败、死锁、超时等场景的容错测试。
    -   建议：在 Base Test 中增加数据库故障模拟。

2.  **安全性加固**：
    -   Auth: 修复用户名枚举漏洞。
    -   User: 移除或加强默认密码策略。

3.  **并发控制**：
    -   Attendance: 引入 Redis 锁或数据库唯一索引防止重复打卡。

4.  **下一步**：
    -   按优先级（🔴 > 🟡 > 🟢）补充上述缺失的测试用例。
    -   修复发现的代码逻辑问题（如 Auth 错误提示、User 搜索功能）。
