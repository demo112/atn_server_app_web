# 安全加固需求文档 (Gap Filling)

## 1. 背景
基于 `hardening-report.md` 的测试结果，系统在 Server、Web、App 端均存在输入校验缺失的安全隐患。本需求旨在系统性修复这些漏洞。

## 2. 核心需求

### 2.1 Server 端加固
**目标**: 确保所有 API 入口均有严格的运行时校验。

| ID | 需求描述 | 验收标准 |
|----|----------|----------|
| S-01 | User DTO 加固 | `UserDTO` 所有字符串字段必须包含 `.max()` 限制 |
| S-02 | Attendance 运行时校验 | 考勤模块接口必须使用 Zod Schema 替代 Interface 进行运行时校验 |
| S-03 | Leave 运行时校验 | 请假模块接口必须使用 Zod Schema 替代 Interface 进行运行时校验 |
| S-04 | 全局长度限制 | 所有新增 Schema 的字符串字段默认长度限制为 100-200 字符，备注字段可放宽至 500 |

### 2.2 Web 端加固
**目标**: 完善前端表单校验，提升用户体验。

| ID | 需求描述 | 验收标准 |
|----|----------|----------|
| W-01 | Schema 完整性 | 修复 `lint-schema.ts` 发现的所有 (106处) 缺失 `.max()` 的 Zod Schema |
| W-02 | 统一长度限制 | 确保 Schema 限制与后端数据库/DTO 保持一致 |

### 2.3 App 端加固
**目标**: 防止导航参数攻击。

| ID | 需求描述 | 验收标准 |
|----|----------|----------|
| A-01 | 路由参数校验 | 修复 `lint-nav.ts` 发现的所有 (13处) 不安全 `route.params` 访问，增加 Zod 校验 |

## 3. 验证计划
所有修复完成后，运行 `scripts/security-check.ts`，预期结果必须全为 `SECURE`。

```bash
npx tsx scripts/security-check.ts
```

## 4. 交付物
- 更新后的 Server DTO/Controller
- 更新后的 Web Schemas
- 更新后的 App Screens
- 全绿的 Security Check 报告
