# Git 基础规范

## 强制规则
1. **全中文描述**: commit message 必须中文，禁止 Update/Fix/Add 等英文动词
2. **禁止模糊描述**: 标题必须具体说明「做了什么 + 为什么」
3. **非交互式执行**: 使用 `git --no-pager`
4. **Push 前必须编译通过**: `npm run build`

## 分支策略
| 分支 | 用途 |
|------|------|
| main | 稳定版本 |
| feature/xxx | 新功能 |
| fix/xxx | Bug修复 |
| refactor/xxx | 重构 |
| docs/xxx | 文档 |

## 原子提交标准
- 单一职责：只做一件事
- 完整性：代码可编译运行
- 可回滚：可独立 revert
