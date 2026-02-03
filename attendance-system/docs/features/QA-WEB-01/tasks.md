# Tasks: Web端测试覆盖提升 (迭代1)

## 任务列表

| ID | 任务 | 优先级 | 状态 |
|----|------|--------|------|
| T1 | **基础设施修复** <br> - 完善 `src/test/setup.ts` <br> - 验证 `pnpm test` 环境 | P0 | ✅ |
| T2 | **工具函数测试** <br> - `utils/auth.test.ts` <br> - `utils/request.test.ts` | P1 | ✅ |
| T3 | **公共组件测试** <br> - `components/DepartmentSelect/index.test.tsx` | P1 | ✅ |
| T4 | **登录集成测试** <br> - `src/__tests__/integration/login.test.tsx` | P1 | ✅ |
| T5 | **部门集成测试** <br> - `src/__tests__/integration/department.test.tsx` | P2 | ✅ |
| T6 | **员工集成测试** <br> - `src/__tests__/integration/employee.test.tsx` | P2 | ✅ |
| T7 | **考勤集成测试** <br> - `src/__tests__/integration/attendance.test.tsx` | P2 | ✅ |

## 完成标准 (DoD)

### 代码层面
- [ ] `pnpm test` 全部通过
- [ ] 符合 `.trae/rules/11-testing.md` 命名规范
- [ ] 核心 Utils 覆盖率 > 90%

### 文档层面
- [ ] `design.md` 保持同步
