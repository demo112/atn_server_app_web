# Web 自动化测试任务清单

## 任务概览

| ID | 任务描述 | 优先级 | 状态 | 负责人 |
|----|----------|--------|------|--------|
| T001 | 搭建测试基础设施 (`renderWithProviders`, Mock Setup) | High | ✅ | AI |
| T002 | 实现 Auth 模块测试 (Login, AuthGuard) | High | ✅ | AI |
| T003 | 实现 Leave 模块测试 (基础 CRUD) | High | ✅ | AI |
| T004 | **Leave 模块深度覆盖** (表单校验, 状态流转, 筛选) | High | ✅ | AI |
| T005 | 实现 Shift 模块测试 (基础 CRUD) | High | ✅ | AI |
| T006 | **Shift 模块深度覆盖** (多段/跨天, 删除保护) | High | 🔄 | AI |
| T007 | 实现 Correction 模块测试 | Medium | ✅ | AI |
| T008 | 实现 Department 模块测试 | Medium | ✅ | AI |
| T009 | 实现 Statistics 模块测试 | Low | ✅ | AI |
| T010 | 修复 Web 构建错误 (TS 类型修复) | High | ✅ | AI |

## 详细进度

### T004: Leave 模块深度覆盖 ✅
- [x] 表单必填项与格式校验
- [x] 撤销流程完整交互
- [x] 已撤销记录编辑限制
- [x] 筛选条件参数传递
- [x] API 异常处理

### T006: Shift 模块深度覆盖 🔄
- [ ] 多段班次创建 (2次/3次打卡)
- [ ] 跨天班次逻辑 (22:00 - 06:00)
- [ ] 动态表单交互 (切换打卡次数)
- [ ] 编辑回显 (复杂数据结构)
- [ ] 删除保护 (引用完整性错误处理)

### T010: 构建修复 ✅
- [x] 修复 `__tests__` 下的 unused variables
- [x] 修复 `ShiftPage` 的 unused imports
- [x] 修复 `auth.property.test.ts` 类型不匹配
- [x] 验证 `pnpm build` 通过
