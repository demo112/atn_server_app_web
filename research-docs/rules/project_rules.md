# 项目规则

这是考勤系统项目的全局规则，所有开发活动必须遵守。

---

## 技术栈

| 类型 | 技术 | 说明 |
|------|------|------|
| 后端运行时 | Node.js | LTS版本 |
| 后端框架 | Express | 轻量级，生态成熟 |
| 语言 | TypeScript | 严格模式 |
| ORM | Prisma | 类型安全 |
| 数据库 | MySQL | 腾讯云托管 |
| 缓存 | Redis | 腾讯云托管 |
| 消息队列 | BullMQ | 基于Redis |
| 前端Web | React | 生态最大 |
| 前端App | React Native | 跨平台 |
| 反向代理 | Nginx | 生产环境 |

---

## 代码规范

### TypeScript

```typescript
// tsconfig.json 必须启用严格模式
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true
  }
}
```

| 规则 | 说明 |
|------|------|
| 禁止 `any` | 使用 `unknown` 或具体类型 |
| 必须有返回类型 | 所有函数显式声明返回类型 |
| 禁止 `!` 断言 | 使用类型守卫或可选链 |

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `getUserById` |
| 类/接口/类型 | PascalCase | `UserService` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 文件名 | kebab-case | `user-service.ts` |
| 目录名 | kebab-case | `user-management` |

### 文件组织

```
packages/
├── server/                 # 后端
│   └── src/
│       ├── modules/        # 业务模块
│       │   └── {module}/
│       │       ├── {module}.controller.ts
│       │       ├── {module}.service.ts
│       │       ├── {module}.dto.ts
│       │       └── {module}.test.ts
│       ├── common/         # 服务端公共代码
│       │   └── utils/      # 服务端工具函数
│       ├── types/          # 服务端类型定义
│       └── config/         # 配置
├── web/                    # Web前端
│   └── src/
│       ├── pages/          # 页面
│       ├── components/     # 组件
│       ├── hooks/          # Hooks
│       ├── utils/          # Web工具函数
│       └── types/          # Web类型定义
└── app/                    # App前端
    └── src/
        ├── screens/        # 页面
        ├── components/     # 组件
        ├── hooks/          # Hooks
        ├── utils/          # App工具函数
        └── types/          # App类型定义
```

> **注意**：各端代码独立维护，不共享代码。server、web、app 各自管理自己的 types 和 utils。

---

## API规范

### 路径格式

```
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{sub-resource}
```

| 方法 | 用途 | 示例 |
|------|------|------|
| GET | 查询 | `GET /api/v1/users` |
| POST | 创建 | `POST /api/v1/users` |
| PUT | 全量更新 | `PUT /api/v1/users/1` |
| PATCH | 部分更新 | `PATCH /api/v1/users/1` |
| DELETE | 删除 | `DELETE /api/v1/users/1` |

### 响应格式

```typescript
// 成功响应
interface SuccessResponse<T> {
  success: true
  data: T
}

// 错误响应
interface ErrorResponse {
  success: false
  error: {
    code: string      // ERR_{MODULE}_{TYPE}
    message: string   // 用户可读的错误信息
  }
}

// 分页响应
interface PageResponse<T> {
  success: true
  data: {
    items: T[]
    total: number
    page: number
    pageSize: number
  }
}
```

### 错误码格式

```
ERR_{MODULE}_{TYPE}

示例：
- ERR_USER_NOT_FOUND
- ERR_AUTH_INVALID_TOKEN
- ERR_ATTENDANCE_DUPLICATE
```

### HTTP状态码

| 状态码 | 用途 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 安全规范

| 规则 | 说明 |
|------|------|
| 禁止硬编码密钥 | 使用环境变量 |
| 输入验证 | 所有用户输入必须验证 |
| SQL注入防护 | 使用Prisma参数化查询 |
| XSS防护 | 输出转义 |
| CSRF防护 | 使用Token |
| 敏感操作日志 | 登录、权限变更等必须记录 |
| 密码存储 | bcrypt加密，禁止明文 |
| Token | JWT，设置过期时间 |

---

## 日志规范

### 日志级别

| 级别 | 用途 | 示例 |
|------|------|------|
| ERROR | 错误，需要关注 | 数据库连接失败 |
| WARN | 警告，可能有问题 | 重试次数过多 |
| INFO | 重要信息 | 用户登录、打卡 |
| DEBUG | 调试信息 | 函数参数、中间状态 |

### 日志格式

```
[时间] [级别] [模块] [用户ID] 消息 {上下文}
```

示例：
```
[2026-01-29 10:30:00] [INFO] [attendance] [user_123] 用户打卡成功 {"type":"check_in","location":"办公室"}
[2026-01-29 10:30:01] [ERROR] [attendance] [user_456] 打卡失败 {"error":"GPS_UNAVAILABLE"}
```

### WARN及以上级别日志要求

当日志级别为 WARN 或 ERROR 时，必须携带完整的复现信息：

| 字段 | 说明 |
|------|------|
| request | 请求信息（method、url、headers、body），接口场景必填 |
| response | 响应信息（status、body），接口场景必填 |
| stack | 完整调用堆栈，逐级具体到代码行 |
| args | 各层调用的真实参数 |
| context | 相关上下文（用户ID、时间戳、traceId等） |

#### 接口场景示例

```
[2026-01-29 10:30:01] [ERROR] [attendance] [user_456] 打卡失败 {
  "error": "GPS_UNAVAILABLE",
  "request": {
    "method": "POST",
    "url": "/api/v1/attendance/check-in",
    "body": {"type": "check_in", "latitude": null, "longitude": null}
  },
  "response": {
    "status": 400,
    "body": {"success": false, "error": {"code": "ERR_ATTENDANCE_GPS_UNAVAILABLE"}}
  },
  "stack": [
    {"file": "attendance.controller.ts", "line": 45, "method": "checkIn"},
    {"file": "attendance.service.ts", "line": 78, "method": "validateLocation"},
    {"file": "gps.util.ts", "line": 23, "method": "getCurrentPosition"}
  ],
  "args": {
    "checkIn": {"userId": "user_456", "type": "check_in"},
    "validateLocation": {"latitude": null, "longitude": null},
    "getCurrentPosition": {}
  },
  "context": {"traceId": "abc123", "timestamp": "2026-01-29T10:30:01Z"}
}
```

#### 方法调用场景示例

```
[2026-01-29 10:35:00] [WARN] [scheduler] [system] 定时任务执行超时 {
  "error": "TASK_TIMEOUT",
  "stack": [
    {"file": "scheduler.service.ts", "line": 120, "method": "runTask"},
    {"file": "attendance.service.ts", "line": 200, "method": "generateDailyReport"},
    {"file": "report.util.ts", "line": 55, "method": "aggregateData"}
  ],
  "args": {
    "runTask": {"taskId": "daily_report", "scheduledAt": "2026-01-29T10:30:00Z"},
    "generateDailyReport": {"date": "2026-01-29", "departmentId": "dept_001"},
    "aggregateData": {"records": "[...1000 items]", "groupBy": "user"}
  },
  "context": {"traceId": "def456", "timestamp": "2026-01-29T10:35:00Z", "duration": 30500}
}
```

### 禁止记录

- 密码
- Token
- 身份证号
- 银行卡号
- 其他敏感信息

---

## Git规范

Git 管理遵循「原子提交」和「持续集成」的最佳实践。

### ⚠️ 强制规则

#### 规则 1: 全中文描述

**所有 commit message 必须使用中文**，禁止出现英文动词。

| 禁止 ❌ | 使用 ✅ |
|---------|---------|
| Update | 更新、调整、完善 |
| Fix | 修复、解决 |
| Add | 新增、添加 |
| Remove | 移除、删除 |
| Refactor | 重构、优化 |
| Improve | 改进、增强 |

#### 规则 2: 禁止模糊描述

```
❌ docs: Update xxx documentation
✅ docs(api): 补充接口参数说明和返回值示例

❌ fix: Fix bug in parser
✅ fix(parser): 修复嵌套 JSON 中转义字符导致的解析失败

❌ feat: Add new feature
✅ feat(attendance): 新增 GPS 打卡的位置校验功能

❌ refactor: Refactor code
✅ refactor(pipeline): 将串行处理重构为并行流水线模式
```

#### 规则 3: 标题必须具体

标题行必须回答：**做了什么 + 为什么/解决什么问题**

```
❌ 修复 bug
✅ 修复并发请求时数据竞争导致的结果丢失问题

❌ 更新文档
✅ 补充考勤接口的请求参数和错误码说明

❌ 优化性能
✅ 优化批量查询性能，处理时间从 5s 降至 0.8s
```

#### 规则 4: 冲突处理策略

**预防优先**：
- 通过模块分工避免冲突（A 负责 user，B 负责 attendance）
- 开始改文件前先沟通，避免同时修改同一文件
- 频繁 push，减少本地积压
- 每次开始工作前先 `git pull`

**冲突发生时**：
- AI 分析冲突并提出解决方案
- **AI 判断必须完全基于 `.trae/specs/{feature}/requirements.md` 文档**
- 禁止无依据猜测或推演
- 用户确认后执行

| 冲突类型 | 处理方式 |
|----------|----------|
| 简单冲突（互不影响） | AI 自动合并，用户确认 |
| 复杂冲突（同行修改） | AI 列出选项，用户选择 |
| 无法判断（需求文档未覆盖） | 暂停，请求用户补充需求 |

**冲突解决示例**：

```
检测到冲突，AI 分析中...

冲突文件: packages/server/src/modules/user/user.service.ts

本地版本（你的改动）:
+ 新增 getUserProfile 方法

远程版本（对方的改动）:
+ 新增 updateUserAvatar 方法

依据: .trae/specs/user-management/requirements.md
- Story 1 要求: 用户可查看个人资料 → getUserProfile ✓
- Story 3 要求: 用户可修改头像 → updateUserAvatar ✓

分析: 两个改动分别对应不同 Story，互不影响

处理方案: 保留双方改动

请确认是否允许 AI 执行合并？
```

**复杂冲突示例**：

```
⚠️ 检测到复杂冲突，需要人工决策

冲突位置: user.service.ts 第 45 行

你的版本: return user.name
对方版本: return user.displayName

查阅 .trae/specs/user-management/requirements.md:
- 未找到明确说明应使用 name 还是 displayName

请选择：
1. 用 user.name
2. 用 user.displayName
3. 补充需求文档后再处理
```

**禁止用户自行解决代码冲突**

#### 规则 5: 非交互式执行

在自动化执行 Git 命令时，必须使用 `--no-pager` 参数：

```bash
git --no-pager status
git --no-pager diff
git --no-pager log
```

#### 规则 6: Push 前必须编译通过

**禁止推送编译失败的代码**。Push 前必须执行：

```bash
# TypeScript 编译检查
npm run build

# 或分端检查
npm run build --workspace=packages/server
npm run build --workspace=packages/web
npm run build --workspace=packages/app
```

| 检查项 | 要求 |
|--------|------|
| 编译 | 必须通过，无错误 |
| 类型检查 | 必须通过，无 TS 错误 |
| Lint | 建议通过，警告可接受 |

### 自动触发时机

| 触发时机 | 动作 |
|----------|------|
| 完成一个独立功能点 | 自动提交 |
| 修复一个 Bug | 自动提交 |
| 重构完成且测试通过 | 自动提交 |
| 文档更新完成 | 自动提交 |
| 任务中断/暂停前 | 检查并提醒 |
| 切换到新任务前 | 确保当前变更已提交 |

### 原子提交判断标准

一个「原子提交」应满足：

1. **单一职责**: 只做一件事
2. **完整性**: 代码可编译/运行，不破坏现有功能
3. **可回滚**: 可以独立 revert 而不影响其他功能
4. **可理解**: commit message 能清晰描述变更内容

#### 何时应该提交

- ✅ 新增一个完整的函数/类/模块
- ✅ 修复一个具体的 Bug
- ✅ 完成一个 API 端点
- ✅ 更新配置文件
- ✅ 添加/修改测试用例
- ✅ 更新文档

#### 何时不应该提交

- ❌ 代码写了一半，语法错误
- ❌ 功能未完成，依赖缺失
- ❌ 测试未通过
- ❌ 临时调试代码未清理

### Commit Message 规范

#### 完整格式

```
<type>(<scope>): <标题行 - 简述做了什么>

<正文 - 详细描述>
- 为什么要做这个变更（背景/动机）
- 具体做了哪些修改（变更内容）
- 这个变更会带来什么影响（影响范围）

<可选: 关联信息>
关联任务: #issue编号 或 任务名称
破坏性变更: 如有，说明兼容性影响
```

#### 标题行规范（必填）

- **语言**: 必须使用中文
- **长度**: 不超过 50 字符
- **内容**: 清晰描述「做了什么」，而非「改了什么文件」
- **时态**: 使用祈使句，如「新增」「修复」「优化」「重构」

#### 正文规范（重要变更必填）

正文应回答三个问题：

1. **为什么 (Why)**: 变更的背景和动机
2. **做了什么 (What)**: 具体的变更内容
3. **影响什么 (Impact)**: 变更的影响范围

### 提交类型

| Type | 使用场景 | 标题示例 |
|------|----------|----------|
| feat | 新增功能、新增模块 | 新增用户登录的短信验证功能 |
| fix | 修复 Bug、修复异常 | 修复并发请求时的数据竞争问题 |
| refactor | 重构代码、优化结构 | 将回调模式重构为 async/await |
| docs | 文档、注释变更 | 补充 API 接口的参数说明文档 |
| test | 测试用例变更 | 添加边界条件的单元测试覆盖 |
| chore | 构建、配置、依赖 | 升级依赖至最新稳定版 |
| perf | 性能优化 | 优化大数据量下的查询性能 |
| style | 代码格式化 | 统一代码缩进和命名风格 |
| ci | CI/CD 配置 | 添加自动化测试的 GitHub Actions |

### Scope 识别规则

根据文件路径自动识别：

| 路径模式 | Scope |
|----------|-------|
| `packages/server/src/modules/user/*` | user |
| `packages/server/src/modules/attendance/*` | attendance |
| `packages/server/src/modules/auth/*` | auth |
| `packages/server/src/common/*` | common |
| `packages/web/src/*` | web |
| `packages/app/src/*` | app |
| `docs/*` | docs |
| `tests/*` | test |

多个 scope 时：取主要变更的 scope，或使用逗号分隔如 `feat(web,server)`

### 提交前自检清单

在生成 commit message 前，必须自检：

#### 语言检查
- [ ] 标题行是否全中文？
- [ ] 是否包含 Update/Fix/Add 等英文动词？→ 如有，必须改为中文

#### 内容检查
- [ ] 标题是否具体描述了「做了什么」？
- [ ] 标题是否说明了「为什么做」或「解决什么问题」？
- [ ] scope 是否准确反映变更的模块？

#### 格式检查
- [ ] 标题长度是否不超过 50 字符？
- [ ] 重要变更是否有正文说明？
- [ ] 正文是否包含背景、变更内容、影响范围？

### 特殊场景处理

#### 大型变更（超过 5 个文件）

必须在正文中详细说明，建议拆分为多个 commit。

#### 破坏性变更

在 footer 中标注：

```
BREAKING CHANGE: 移除了 deprecated 的 API，需要更新调用方式
迁移指南: 将 old_method() 替换为 new_method()
```

#### WIP 提交（任务中断）

```
wip(attendance): 打卡逻辑开发中，待完成位置校验

当前进度:
- [x] 基础打卡接口
- [x] 时间校验
- [ ] 位置校验
- [ ] 单元测试

中断原因: 等待产品确认校验规则
```

### 分支策略

| 分支 | 用途 |
|------|------|
| main | 稳定版本，可部署 |
| feature/功能简述 | 新功能开发 |
| fix/问题简述 | Bug 修复 |
| refactor/重构简述 | 重构 |
| docs/文档简述 | 文档更新 |

### 分支命名规范

```
feature/gps-checkin      # 新功能
fix/concurrent-data-race # Bug 修复
refactor/async-llm       # 重构
docs/api-params          # 文档更新
```

### 提交示例

#### 功能开发

```
feat(attendance): 新增 GPS 打卡的位置校验功能

背景:
- 用户需要在指定范围内才能打卡
- 防止远程虚假打卡

变更内容:
- 新增 LocationValidator 类处理位置校验
- 在 AttendanceService.checkIn 中集成校验逻辑
- 添加位置校验的单元测试

影响范围:
- 打卡接口新增位置参数校验
- 超出范围返回 ERR_ATTENDANCE_OUT_OF_RANGE

关联任务: #45
```

#### Bug 修复

```
fix(auth): 修复并发登录时 Token 覆盖导致的会话丢失

背景:
- 用户反馈多设备登录时会被踢出
- 问题出现在同时登录的竞态条件下

变更内容:
- 修复 TokenService.generate() 中的竞态条件
- 添加设备标识区分不同登录会话
- 补充并发登录的测试用例

影响范围:
- 修复影响所有多设备登录场景
- 无破坏性变更
```

#### 重构

```
refactor(server): 将同步数据库操作重构为异步模式

背景:
- 同步操作导致请求阻塞，响应慢
- 需要支持更高并发

变更内容:
- 重构 UserRepository 使用 async/await
- 更新所有 Service 层适配异步调用
- 更新测试用例适配异步模式

影响范围:
- 所有数据库操作改为异步
- 响应速度提升约 40%

BREAKING CHANGE: Repository 方法改为异步，调用方需要 await
```

### 配置选项

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| auto_commit | true | 是否自动提交 |
| auto_push | false | 是否自动推送 |
| require_test_pass | true | 提交前是否要求测试通过 |
| max_files_per_commit | 10 | 单次提交最大文件数 |
| branch_on_large_change | true | 大变更时是否建议创建分支 |

---

## 公共代码规则

### 公共代码定义

以下文件属于公共代码：
- `packages/server/src/common/**/*`（包含 utils）
- `packages/server/src/types/common.ts`
- `packages/web/src/types/common.ts`
- `packages/web/src/utils/common.ts`
- `packages/app/src/types/common.ts`
- `packages/app/src/utils/common.ts`

### 修改规则

| 规则 | 说明 |
|------|------|
| 禁止AI自行修改 | AI不得自行修改公共代码 |
| 修改前必须沟通 | 需要修改时，先告知用户 |
| 获得确认后修改 | 用户确认后才能修改 |
| 修改后通知 | 修改后通知所有相关人员 |

### AI遇到需要修改公共代码时

```
⚠️ 需要修改公共代码

我需要修改 `packages/server/src/common/xxx.ts`，原因是：
{原因}

修改内容：
{具体修改}

这会影响：
{影响范围}

请确认是否允许修改。
```

---

## 测试规范

### 测试类型

| 类型 | 位置 | 命名 |
|------|------|------|
| 单元测试 | 同目录 | `*.test.ts` |
| 集成测试 | `__tests__/` | `*.integration.test.ts` |
| E2E测试 | `e2e/` | `*.e2e.test.ts` |

### 测试覆盖要求

| 模块 | 最低覆盖率 | 说明 |
|------|-----------|------|
| API接口 | 95% | 用户直接入口，必须充分覆盖 |
| 核心业务逻辑 | 90% | 关键路径不能有盲区 |
| 工具函数 | 90% | 复用度高，需保证稳定 |

---

## 环境配置

### 环境变量

```bash
# .env.example
NODE_ENV=development
PORT=3000

# 数据库
DATABASE_URL=mysql://user:pass@host:3306/db

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 日志
LOG_LEVEL=info
```

### 环境区分

| 环境 | 用途 |
|------|------|
| development | 本地开发 |
| test | 测试 |
| production | 生产 |
