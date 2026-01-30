# 个人规则模板

每个开发者创建自己的 `user_rules.md`，声明负责的模块和命名空间。

---

## 使用方法

1. 复制此模板为 `user_rules_{你的名字}.md`
2. 填写你负责的模块
3. AI会根据此文件限制操作范围

---

## 模板

```markdown
# 个人规则

## 我是谁

{你的名字/代号}

## 负责模块

我负责以下模块：
- {模块1}
- {模块2}

## 命名空间

### 类型前缀

我的类型定义使用以下前缀：
- {Module1}*（如 User*, UserDto, UserVo）
- {Module2}*（如 Attendance*, AttendanceDto）

### API路径

我的API使用以下路径：
- /api/v1/{module1}/*
- /api/v1/{module2}/*

### 文件路径

我只能操作以下路径的文件：

**Server:**
- packages/server/src/modules/{module1}/*
- packages/server/src/modules/{module2}/*

**Web:**
- packages/web/src/pages/{module1}/*
- packages/web/src/pages/{module2}/*
- packages/web/src/components/{module1}/*
- packages/web/src/components/{module2}/*

**App:**
- packages/app/src/screens/{module1}/*
- packages/app/src/screens/{module2}/*
- packages/app/src/components/{module1}/*
- packages/app/src/components/{module2}/*

**Shared:**
- packages/shared/src/types/{module1}.ts
- packages/shared/src/types/{module2}.ts
- packages/shared/src/utils/{module1}.ts
- packages/shared/src/utils/{module2}.ts

## 禁止操作

以下路径我不能操作（属于其他人或公共代码）：
- packages/shared/src/types/common.ts（公共代码）
- packages/shared/src/utils/common.ts（公共代码）
- packages/server/src/common/*（公共代码）
- {其他人负责的模块路径}

## 协作规则

### 需要修改公共代码时

如果我需要修改公共代码，必须：
1. 先告知用户
2. 说明修改原因和影响
3. 获得确认后才能修改

### 需要调用其他模块时

如果我需要调用其他人负责的模块：
1. 只能通过已定义的接口调用
2. 不能修改其他模块的代码
3. 如需新接口，告知用户协调
```

---

## 示例：用户A的规则

```markdown
# 个人规则

## 我是谁

用户A

## 负责模块

我负责以下模块：
- user（用户管理）
- auth（认证授权）

## 命名空间

### 类型前缀

- User*（UserDto, UserVo, UserEntity）
- Auth*（AuthDto, LoginDto, TokenVo）

### API路径

- /api/v1/user/*
- /api/v1/auth/*

### 文件路径

**Server:**
- packages/server/src/modules/user/*
- packages/server/src/modules/auth/*

**Web:**
- packages/web/src/pages/user/*
- packages/web/src/pages/auth/*
- packages/web/src/components/user/*
- packages/web/src/components/auth/*

**App:**
- packages/app/src/screens/user/*
- packages/app/src/screens/auth/*
- packages/app/src/components/user/*
- packages/app/src/components/auth/*

**Shared:**
- packages/shared/src/types/user.ts
- packages/shared/src/types/auth.ts
- packages/shared/src/utils/user.ts
- packages/shared/src/utils/auth.ts

## 禁止操作

- packages/shared/src/types/common.ts
- packages/shared/src/utils/common.ts
- packages/server/src/common/*
- packages/server/src/modules/attendance/*（用户B负责）
- packages/server/src/modules/report/*（用户B负责）
```

---

## 示例：用户B的规则

```markdown
# 个人规则

## 我是谁

用户B

## 负责模块

我负责以下模块：
- attendance（考勤打卡）
- report（报表统计）

## 命名空间

### 类型前缀

- Attendance*（AttendanceDto, AttendanceRecordVo）
- Report*（ReportDto, ReportVo）

### API路径

- /api/v1/attendance/*
- /api/v1/report/*

### 文件路径

**Server:**
- packages/server/src/modules/attendance/*
- packages/server/src/modules/report/*

**Web:**
- packages/web/src/pages/attendance/*
- packages/web/src/pages/report/*
- packages/web/src/components/attendance/*
- packages/web/src/components/report/*

**App:**
- packages/app/src/screens/attendance/*
- packages/app/src/screens/report/*
- packages/app/src/components/attendance/*
- packages/app/src/components/report/*

**Shared:**
- packages/shared/src/types/attendance.ts
- packages/shared/src/types/report.ts
- packages/shared/src/utils/attendance.ts
- packages/shared/src/utils/report.ts

## 禁止操作

- packages/shared/src/types/common.ts
- packages/shared/src/utils/common.ts
- packages/server/src/common/*
- packages/server/src/modules/user/*（用户A负责）
- packages/server/src/modules/auth/*（用户A负责）
```

---

## AI如何使用这些规则

AI在执行任务时会：

1. **检查文件路径**：操作文件前检查是否在允许的路径内
2. **检查命名**：创建类型/API时检查是否使用正确的前缀
3. **拒绝越界**：如果操作超出命名空间，拒绝并提示用户
4. **公共代码保护**：修改公共代码前必须请求确认

### AI遇到越界操作时的响应

```
⚠️ 操作超出命名空间

你要求我修改 `packages/server/src/modules/user/user.service.ts`，
但根据你的 user_rules.md，你负责的模块是 attendance 和 report。

请选择：
1. 联系负责 user 模块的同事处理
2. 确认这是你的职责范围（我会更新规则）
```
