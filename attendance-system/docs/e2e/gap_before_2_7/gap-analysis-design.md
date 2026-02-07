# 漏测分析补充测试设计方案 (Gap Analysis Design)

> **版本**: 1.1 (Revised)
> **日期**: 2026-02-07
> **状态**: 待评审
> **对应需求**: `docs/e2e/gap-analysis-requirements.md`
> **核心原则**: **只测不改** (Only Test, No Code Changes)

## 1. 总体策略

本方案严格遵循“只测不改”原则。目标是通过**自动化扫描**和**集中式契约测试**，快速识别系统中的共性漏测问题，并生成详细的**问题报告**，为后续的修复工作提供精准的输入。

| 类别 | 目标 | 策略 | 交付物 |
|:---|:---|:---|:---|
| **Server** | 发现 API 契约违规 | 动态契约扫描 (Integration Test) | 测试失败报告 (JUnit/Console Log) |
| **Web** | 发现 Schema 隐患 | 静态代码分析 (Script) | Schema 问题清单 (Markdown/Text) |
| **App** | 发现导航风险 | 静态代码分析 (Script) | 导航风险清单 (Markdown/Text) |

---

## 2. Server 端设计 (API 契约扫描)

### 2.1 目标
暴露不符合 Requirement 1 (Delete Response) 和 Requirement 2 (Query Type) 的接口。

### 2.2 实现方案
创建一个集中的集成测试文件 `packages/server/src/test/gap-analysis/api-contract.spec.ts`。

#### 资源配置表
定义系统中所有的资源及其操作元数据（复用现有接口，不修改代码）：

```typescript
// packages/server/src/test/gap-analysis/resource-config.ts
export const RESOURCES = [
  {
    name: 'Department',
    endpoint: '/api/v1/departments',
    createDto: { name: 'Test Dept GAP', code: 'GAP001' }, 
    listParams: { page: "1", pageSize: "10" }, 
  },
  // ... 其他模块
];
```

#### 测试用例模板
测试用例将执行断言，如果代码未修复，测试将**失败**。这正是我们预期的结果（Red Test）。

```typescript
describe('Gap Analysis - API Contract Scan', () => {
  RESOURCES.forEach(resource => {
    describe(resource.name, () => {
      // ... setup ...

      // Expectation: DELETE returns { id }
      // Current Reality: Returns null (Test will FAIL)
      test('DELETE should return { id }', async () => {
        const res = await request(app)
          .delete(`${resource.endpoint}/${createdId}`)
          .expect(200);
        
        // 此断言在当前代码下会失败，从而暴露问题
        expect(res.body).toEqual(expect.objectContaining({
          data: { id: createdId }
        }));
      });
    });
  });
});
```

---

## 3. Web 端设计 (Schema 静态审计)

### 3.1 目标
生成不符合 Requirement 4 (Zod Schema Null 兼容性) 的文件清单。

### 3.2 实现方案
编写脚本 `packages/web/scripts/audit-schemas.ts`。

#### 扫描逻辑
1.  遍历 `packages/web/src/schemas/*.ts`。
2.  **Pattern**: `.optional()` 出现但同一行/链中没有 `.nullable()`。
3.  **Output**: 将扫描结果输出到 `docs/e2e/reports/web-schema-gaps.md`。
4.  **No Auto-Fix**: 脚本仅报告，不执行修改。

---

## 4. App 端设计 (导航安全审计)

### 4.1 目标
生成不符合 Requirement 5 (App 导航安全) 的组件清单。

### 4.2 实现方案
编写脚本 `packages/app/scripts/audit-navigation.sh`。

#### 扫描逻辑
1.  遍历 `packages/app/src/screens/**/*.tsx`。
2.  **Check**: 使用 `navigation.` 但未定义 `const navigation`。
3.  **Output**: 将扫描结果输出到 `docs/e2e/reports/app-navigation-gaps.md`。

---

## 5. DTO 边界值校验设计 (Server)

### 5.1 目标
验证 Requirement 3 (DTO 长度校验)。

### 5.2 实现方案
在 `packages/server/src/test/gap-analysis/dto-scan.spec.ts` 中实现。

#### 策略
1.  编写针对关键 DTO (Employee, User) 的单元测试。
2.  输入超长字符串。
3.  断言期望抛出 Validation Error。
4.  如果当前未校验，测试将失败（或未抛出异常），从而暴露问题。

---

## 6. 交付物

1.  `packages/server/test/gap-analysis/` 测试代码。
2.  `packages/web/scripts/audit-schemas.ts` 审计脚本。
3.  `packages/app/scripts/audit-navigation.sh` 审计脚本。
4.  **问题报告**:
    *   Server 测试运行日志 (显示失败的用例)。
    *   `docs/e2e/reports/web-schema-gaps.md`
    *   `docs/e2e/reports/app-navigation-gaps.md`
